import { AI_MODELS } from '../constants/theme';
import { ChatMessage } from '../store/useAppStore';

const BASE_URL = 'https://api.experientiallabs.ai/v1';

// ==================== HARDCODED API KEY ====================
// Key is embedded - users don't need to enter it manually
const DEFAULT_API_KEY = 'xpl_76a550bb70e209cceffb5a0f3168fddb105893b9';

// ==================== SUARI AI SERVICE ====================

interface CompletionOptions {
  messages: { role: string; content: string }[];
  model?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  onChunk?: (chunk: string) => void;
}

export async function callSuariAI(
  apiKey: string = DEFAULT_API_KEY,
  options: CompletionOptions
): Promise<string> {
  const {
    messages,
    model = AI_MODELS.default,
    temperature = 0.7,
    maxTokens = 2000,
  } = options;

  // Always use default key if none provided
  const key = apiKey?.trim() || DEFAULT_API_KEY;

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'कोई जवाब नहीं मिला।';
  } catch (error: any) {
    if (error.message.includes('API Error')) throw error;
    throw new Error(`नेटवर्क त्रुटि: ${error.message}`);
  }
}

// ==================== SYSTEM PROMPTS ====================

export const SUARI_SYSTEM_PROMPTS = {
  chat: `तुम "Suari" हो - Suari Ka Alarm ऐप का AI सहायक। तुम एक friendly, smart और helpful AI हो।

तुम्हारे बारे में:
- नाम: Suari
- भाषा: Hindi और English दोनों में बात करो (user जैसी भाषा बोलो)
- Personality: Smart, caring, thoda funny, बहुत helpful
- तुम user को alarm, study, todo सब में help करते हो

तुम ये कर सकते हो:
- किसी भी topic पर बात करना
- Study tips देना
- Schedule और time management में help करना
- General knowledge share करना
- User को motivate करना

हमेशा helpful, positive और encouraging रहो।`,

  agent: `तुम "Suari" हो - एक powerful AI Agent। तुम्हारे पास ये capabilities हैं:

1. **Alarm Management**: User को alarm set करने में help करो
2. **Todo Management**: Tasks create करने में help करो  
3. **Syllabus Planning**: Subject-wise syllabus create करने में help करो

जब user कोई action कहे (जैसे "alarm set करो"), तो JSON format में response दो:
{
  "action": "set_alarm",
  "params": { "time": "06:30 AM", "label": "Morning Wakeup" },
  "message": "user को बताने वाला message"
}
या Todo के लिए:
{
  "action": "add_todo",
  "params": { "title": "Math homework", "priority": "high", "dueDate": "Tomorrow" },
  "message": "user को बताने वाला message"
}
या Syllabus के लिए:
{
  "action": "create_syllabus",
  "params": { "subject": "Science" },
  "message": "user को बताने वाला message"
}

अगर कोई action नहीं है तो normal text में respond करो।`,

  research: `तुम "Suari" हो - एक Research Expert AI। तुम्हारा काम है deep, detailed research provide करना।

Research करते समय:
1. Topic को thoroughly explain करो
2. Multiple angles से discuss करो
3. Examples और case studies दो
4. Important points bold में highlight करो
5. Conclusion और key takeaways दो
6. Further reading suggest करो

Format:
- Use clear headings
- Bullet points for lists
- **Bold** for important terms
- Numbered lists for steps
- Always cite sources if possible

Exam के लिए relevant information पर focus करो।`
};

// ==================== AGENT ACTION PARSER ====================

export interface AgentAction {
  action: 'set_alarm' | 'add_todo' | 'create_syllabus' | 'none';
  params: any;
  message: string;
}

export function parseAgentResponse(text: string): { isAction: boolean; action?: AgentAction; text: string } {
  try {
    const jsonMatch = text.match(/\{[\s\S]*"action"[\s\S]*\}/);
    if (jsonMatch) {
      const action = JSON.parse(jsonMatch[0]) as AgentAction;
      return { isAction: true, action, text: action.message };
    }
  } catch (e) {
    // Not JSON, treat as normal text
  }
  return { isAction: false, text };
}

// ==================== INTERNET SEARCH (via AI) ====================

export async function suariWebSearch(
  apiKey: string = DEFAULT_API_KEY,
  query: string
): Promise<string> {
  const key = apiKey?.trim() || DEFAULT_API_KEY;
  const messages = [
    {
      role: 'system',
      content: `तुम एक expert researcher हो। User की query के बारे में detailed, accurate information दो।
      Current Date: ${new Date().toLocaleDateString('hi-IN')}
      
      Format your response with:
      - Clear sections with headings
      - Key facts and data
      - Recent developments (as of your knowledge)
      - Practical information
      
      Hindi में respond करो।`
    },
    {
      role: 'user',
      content: `Research करो: ${query}\n\nDetailed और accurate information दो।`
    }
  ];

  return callSuariAI(key, {
    messages,
    model: AI_MODELS.research,
    temperature: 0.3,
    maxTokens: 3000,
  });
}

// ==================== SYLLABUS FETCHER ====================

export async function fetchSyllabus(
  apiKey: string = DEFAULT_API_KEY,
  subject: string,
  exam?: string
): Promise<{ topics: string[]; subtopics: Record<string, string[]> }> {
  const key = apiKey?.trim() || DEFAULT_API_KEY;
  const messages = [
    {
      role: 'system',
      content: `तुम एक education expert हो। Syllabus topics list करो।
      
      Response ONLY as JSON:
      {
        "topics": ["Topic 1", "Topic 2", ...],
        "subtopics": {
          "Topic 1": ["Subtopic 1.1", "Subtopic 1.2"],
          ...
        }
      }`
    },
    {
      role: 'user',
      content: `${exam ? `${exam} exam के लिए` : ''} ${subject} का complete syllabus JSON format में दो।`
    }
  ];

  try {
    const response = await callSuariAI(key, {
      messages,
      model: AI_MODELS.default,
      temperature: 0.2,
      maxTokens: 2000,
    });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Syllabus fetch error:', e);
  }

  return { topics: [], subtopics: {} };
}

// ==================== STUDY PLAN GENERATOR ====================

export async function generateStudyPlan(
  apiKey: string = DEFAULT_API_KEY,
  subject: string,
  availableHours: number,
  examDate: string
): Promise<string> {
  const key = apiKey?.trim() || DEFAULT_API_KEY;
  const messages = [
    {
      role: 'system',
      content: SUARI_SYSTEM_PROMPTS.research
    },
    {
      role: 'user',
      content: `मुझे ${subject} के लिए study plan बनाओ।
      - Exam Date: ${examDate}
      - Daily available hours: ${availableHours}
      - एक detailed, practical study schedule बनाओ
      - Priority topics से start करो
      - Revision time भी include करो`
    }
  ];

  return callSuariAI(key, { messages, model: AI_MODELS.research });
}

// Export default key for use in components
export { DEFAULT_API_KEY };
