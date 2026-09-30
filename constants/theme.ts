// Suari Ka Alarm - App Constants & Theme

export const COLORS = {
  // Primary palette - Deep Purple & Cosmic
  primary: '#7C5CFC',
  primaryDark: '#5B3FD9',
  primaryLight: '#9E7FFF',
  
  // Secondary - Cyan glow
  secondary: '#00D4FF',
  secondaryDark: '#0099CC',
  
  // Accent - Neon pink
  accent: '#FF6B9D',
  accentDark: '#E0547E',
  
  // Backgrounds
  bg: '#080818',
  bgCard: '#12122A',
  bgCardLight: '#1A1A35',
  bgGlass: 'rgba(124, 92, 252, 0.08)',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C8',
  textMuted: '#606080',
  
  // Status
  success: '#00E676',
  warning: '#FFD740',
  error: '#FF5252',
  
  // Alarm specific
  alarmRing: '#FF4081',
  alarmSnoozed: '#FFD740',
  alarmOff: '#606080',
  
  // Suari AI colors
  suariPrimary: '#FF6B9D',
  suariSecondary: '#7C5CFC',
  suariGlow: 'rgba(255, 107, 157, 0.3)',
  
  // Todo colors
  todoPending: '#FFD740',
  todoComplete: '#00E676',
  
  // Syllabus colors
  syllabusNotStarted: '#FF5252',
  syllabusInProgress: '#FFD740',
  syllabusCompleted: '#00E676',
};

export const GRADIENTS = {
  primary: ['#7C5CFC', '#5B3FD9'],
  cosmic: ['#080818', '#12122A', '#1A1A35'],
  suari: ['#FF6B9D', '#7C5CFC'],
  alarm: ['#FF4081', '#FF6B9D'],
  success: ['#00E676', '#00B248'],
  card: ['#12122A', '#1A1A35'],
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};


export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOW = {
  primary: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  suari: {
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  alarm: {
    shadowColor: '#FF4081',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 12,
  },
};

// AI Models available on Experiential Labs (Gateway supports standard models)
export const AI_MODELS = {
  default: 'gpt-4o',
  research: 'claude-3-5-sonnet-latest',
  fast: 'gemini-1.5-flash',
};

// API Config
export const API_CONFIG = {
  baseURL: 'https://api.experientiallabs.ai/v1',
  // Add your API key in .env as EXPO_PUBLIC_EXPLABS_API_KEY
};

// App Config
export const APP_CONFIG = {
  maxAlarms: 50,
  maxTodos: 500,
  maxSyllabusSubjects: 20,
  defaultSnoozeMinutes: 5,
  maxSnoozeCount: 3,
};

// Days of week
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Alarm sounds
export const ALARM_SOUNDS = [
  { id: 'default', name: 'Default Alarm', file: null },
  { id: 'gentle', name: 'Gentle Wake', file: null },
  { id: 'beep', name: 'Beep Beep', file: null },
  { id: 'digital', name: 'Digital Rise', file: null },
];
