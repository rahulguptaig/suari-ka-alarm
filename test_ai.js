const apiKey = 'xpl_76a550bb70e209cceffb5a0f3168fddb105893b9';
const BASE_URL = 'https://api.experientiallabs.ai/v1';

async function testAI() {
  try {
    console.log('Sending request to API...');
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        messages: [{ role: 'user', content: 'Say hello in Hindi!' }],
        temperature: 0.7,
        max_tokens: 100,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log('Success! AI Responded:');
    console.log(data.choices?.[0]?.message?.content);
  } catch (error) {
    console.error(`Network Error:`, error);
  }
}

testAI();
