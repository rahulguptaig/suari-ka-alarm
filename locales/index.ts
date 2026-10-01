export const languages = {
  en: 'English',
  hin: 'Hinglish',
  hi: 'हिंदी (Hindi)',
  bhoj: 'भोजपुरी (Bhojpuri)',
};

export type LanguageCode = keyof typeof languages;

export const translations = {
  en: {
    // Tabs
    tab_alarms: 'Alarms',
    tab_suari: 'Suari',
    tab_todos: 'Todos',
    tab_syllabus: 'Syllabus',
    tab_settings: 'Settings',

    // Settings
    settings_title: 'Settings',
    language: 'Language',
    select_language: 'Select Language',
    backend_sync: 'Backend Sync',
    active: 'Active',
    
    // Alarms
    alarms_title: 'Alarms',
    no_alarms: 'No alarms yet. Tap + to add one.',
    next_alarm: 'Next alarm in',
    active_alarms: 'Active Alarms',
    create_alarm: 'Create Alarm',
    label: 'Label',
    time: 'Time',
    save: 'Save',
    cancel: 'Cancel',
    snooze: 'Snooze',
    stop: 'Stop',
    repeat: 'Repeat',
    sound: 'Sound',
    vibration: 'Vibration',

    // Todos
    todos_title: 'Todos',
    no_todos: 'No tasks. Add one!',
    add_task: 'Add Task',
    task_title: 'Title',
    subject: 'Subject',
    priority: 'Priority',
    due_date: 'Due Date',
    completed: 'Completed',
    pending: 'Pending',
    high: 'High',
    medium: 'Medium',
    low: 'Low',

    // Syllabus
    syllabus_title: 'Syllabus',
    add_subject: 'Add Subject',
    generate_ai: 'Generate AI Syllabus',
    topics: 'Topics',
    progress: 'Progress',

    // AI
    ai_title: 'Suari AI',
    type_message: 'Type a message...',
    send: 'Send',
    agent_mode: 'Agent Mode',
    chat_mode: 'Chat Mode',
    research_mode: 'Research Mode',
  },
  hin: {
    // Tabs
    tab_alarms: 'Alarms',
    tab_suari: 'Suari',
    tab_todos: 'Todos',
    tab_syllabus: 'Syllabus',
    tab_settings: 'Settings',

    // Settings
    settings_title: 'Settings',
    language: 'Language',
    select_language: 'Language Select Karo',
    backend_sync: 'Backend Sync',
    active: 'Active Hai',
    
    // Alarms
    alarms_title: 'Alarms',
    no_alarms: 'Koi alarm nahi hai. + dabake add karo.',
    next_alarm: 'Next alarm bajega',
    active_alarms: 'Chalu Alarms',
    create_alarm: 'Alarm Banao',
    label: 'Naam (Label)',
    time: 'Time',
    save: 'Save Karo',
    cancel: 'Cancel',
    snooze: 'Snooze (Thodi der baad)',
    stop: 'Band Karo',
    repeat: 'Repeat',
    sound: 'Awaaz',
    vibration: 'Vibrate',

    // Todos
    todos_title: 'Todos',
    no_todos: 'Koi task nahi. Add karo!',
    add_task: 'Task Add Karo',
    task_title: 'Kya karna hai?',
    subject: 'Subject',
    priority: 'Priority',
    due_date: 'Kab tak?',
    completed: 'Ho gaya',
    pending: 'Bacha hai',
    high: 'Zaroori (High)',
    medium: 'Theek (Medium)',
    low: 'Aaram se (Low)',

    // Syllabus
    syllabus_title: 'Syllabus',
    add_subject: 'Subject Add Karo',
    generate_ai: 'AI se Syllabus Banao',
    topics: 'Topics',
    progress: 'Progress',

    // AI
    ai_title: 'Suari AI',
    type_message: 'Message likho...',
    send: 'Bhejo',
    agent_mode: 'Agent Mode',
    chat_mode: 'Chat Mode',
    research_mode: 'Research Mode',
  },
  hi: {
    // Tabs
    tab_alarms: 'अलार्म',
    tab_suari: 'सुआरी',
    tab_todos: 'कार्य',
    tab_syllabus: 'पाठ्यक्रम',
    tab_settings: 'सेटिंग्स',

    // Settings
    settings_title: 'सेटिंग्स',
    language: 'भाषा',
    select_language: 'भाषा चुनें',
    backend_sync: 'क्लाउड सिंक',
    active: 'सक्रिय',
    
    // Alarms
    alarms_title: 'अलार्म',
    no_alarms: 'कोई अलार्म नहीं है। नया जोड़ने के लिए + दबाएं।',
    next_alarm: 'अगला अलार्म',
    active_alarms: 'सक्रिय अलार्म',
    create_alarm: 'अलार्म बनाएं',
    label: 'नाम (लेबल)',
    time: 'समय',
    save: 'सुरक्षित करें',
    cancel: 'रद्द करें',
    snooze: 'स्नूज़ (बाद में)',
    stop: 'बंद करें',
    repeat: 'दोहराएं',
    sound: 'आवाज़',
    vibration: 'कंपन',

    // Todos
    todos_title: 'कार्य (Todos)',
    no_todos: 'कोई कार्य नहीं है। नया जोड़ें!',
    add_task: 'कार्य जोड़ें',
    task_title: 'शीर्षक',
    subject: 'विषय',
    priority: 'प्राथमिकता',
    due_date: 'अंतिम तिथि',
    completed: 'पूरा हुआ',
    pending: 'बाकी है',
    high: 'उच्च (High)',
    medium: 'मध्यम (Medium)',
    low: 'निम्न (Low)',

    // Syllabus
    syllabus_title: 'पाठ्यक्रम',
    add_subject: 'विषय जोड़ें',
    generate_ai: 'AI से पाठ्यक्रम बनाएं',
    topics: 'विषय (Topics)',
    progress: 'प्रगति',

    // AI
    ai_title: 'सुआरी एआई (Suari AI)',
    type_message: 'संदेश लिखें...',
    send: 'भेजें',
    agent_mode: 'एजेंट मोड',
    chat_mode: 'चैट मोड',
    research_mode: 'रिसर्च मोड',
  },
  bhoj: {
    // Tabs
    tab_alarms: 'अलार्म',
    tab_suari: 'सुआरी',
    tab_todos: 'काम',
    tab_syllabus: 'सिलेबस',
    tab_settings: 'सेटिंगवा',

    // Settings
    settings_title: 'सेटिंगवा',
    language: 'भासा',
    select_language: 'भासा चुनीं',
    backend_sync: 'क्लाउड सिंक',
    active: 'चालू बा',
    
    // Alarms
    alarms_title: 'अलार्म',
    no_alarms: 'कौनो अलार्म नइखे। + दबा के डालीं।',
    next_alarm: 'अगला अलार्म बजी',
    active_alarms: 'चालू अलार्म',
    create_alarm: 'अलार्म बनाईं',
    label: 'नांव (लेबल)',
    time: 'टेमवा',
    save: 'सेव करीं',
    cancel: 'काट दीं',
    snooze: 'तनिका बाद',
    stop: 'बंद करीं',
    repeat: 'रोज-रोज',
    sound: 'अवाज़िया',
    vibration: 'भनभनाहट',

    // Todos
    todos_title: 'काम-धाम (Todos)',
    no_todos: 'कौनो काम नइखे। नया डालीं!',
    add_task: 'काम डालीं',
    task_title: 'का करे के बा?',
    subject: 'बिसय',
    priority: 'जरूरी',
    due_date: 'कबे ले?',
    completed: 'हो गइल',
    pending: 'बाचल बा',
    high: 'बहुते जरूरी (High)',
    medium: 'ठीक-ठाक (Medium)',
    low: 'आरामे से (Low)',

    // Syllabus
    syllabus_title: 'सिलेबस',
    add_subject: 'बिसय डालीं',
    generate_ai: 'AI से सिलेबस बनाईं',
    topics: 'टॉपिक सब',
    progress: 'कितना भइल',

    // AI
    ai_title: 'सुआरी एआई',
    type_message: 'लिखीं कुछुओ...',
    send: 'भेजीं',
    agent_mode: 'एजेंट मोड',
    chat_mode: 'बतिअवल (Chat) मोड',
    research_mode: 'रिसर्च मोड',
  },
};

export const t = (lang: LanguageCode, key: keyof typeof translations['en']) => {
  return translations['en'][key] || key;
};
