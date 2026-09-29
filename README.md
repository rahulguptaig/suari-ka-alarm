# 🔔 Suari Ka Alarm

> **एक स्मार्ट अलार्म ऐप जिसमें Suari AI Agent है - पढ़ाई से लेकर अलार्म तक सब कुछ**

---

## ✨ Features

### 🔔 Alarm System
- Multiple alarms set करें
- Repeat days (Mon-Sun) customize करें
- Custom alarm sounds
- Vibrate toggle
- Snooze with customizable duration (5/10/15/20 min)
- Beautiful live clock on home screen

### 🤖 Suari AI Agent
- **Chat Mode**: Normal बातचीत, study tips, motivation
- **Agent Mode**: Voice commands से alarms set करें, tasks add करें
- **Research Mode**: Deep research, detailed explanations
- Thread history & conversation management
- Memory & personalization
- Internet search capabilities (via AI)

### ✅ To-Do List
- Priority levels (High/Medium/Low)
- Subject-wise categorization
- Due dates
- Filter & search
- Progress tracking stats

### 📚 Syllabus Tracker
- Subject-wise tracking
- **AI से syllabus fetch करें** (Suari auto-generates topics)
- Topic status tracking (Not Started → In Progress → Completed)
- Progress visualization
- Exam date countdown
- AI Study Plan generation
- Subtopics support

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo (React Native) |
| Language | TypeScript |
| State | Zustand + AsyncStorage |
| Navigation | Expo Router (File-based) |
| AI | Experiential Labs API (OpenAI-compatible) |
| Notifications | expo-notifications |
| UI | Custom Dark Theme + LinearGradient |
| APK Build | EAS Build (GitHub Actions) |

---

## 🚀 Setup Guide

### 1. Repository Clone करें
```bash
git clone https://github.com/YOUR_USERNAME/suari-ka-alarm.git
cd suari-ka-alarm
```

### 2. Dependencies Install करें
```bash
npm install
```

### 3. Environment Variables Setup करें
```bash
cp .env.example .env
```
`.env` file में अपनी API keys डालें:
```env
EXPO_PUBLIC_EXPLABS_API_KEY=xpl_your_key_here
```

### 4. Development Server चालू करें
```bash
npx expo start
```

---

## 📱 APK Build करें

### GitHub Actions से (Recommended)

1. **Expo Account बनाएं**: [expo.dev](https://expo.dev)
2. **EAS CLI install करें**: `npm install -g eas-cli`
3. **Login करें**: `eas login`
4. **GitHub Secret add करें**: `EXPO_TOKEN` = आपका Expo token
5. **Push करें**: GitHub automatically APK build करेगा

### Manual Build
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

APK download link EAS dashboard पर मिलेगा।

---

## 🤖 Suari AI Setup

1. **Experiential Labs पर account बनाएं**: [experientiallabs.ai](https://experientiallabs.ai)
2. **API Key लें**: Platform → Get API Key
3. **App में डालें**: Settings tab → API Key section
4. **Enjoy!** Suari ab आपसे बात कर सकती है! 🌟

### Available AI Models
- `gpt-5.6-luna` - Default (Chat & Agent mode)
- `qwen3.8-27b` - Research mode
- `gemini-3.7-flash` - Fast responses

---

## 📁 Project Structure

```
suari-ka-alarm/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # 🔔 Alarm Screen
│   │   ├── suari.tsx          # 🤖 Suari AI Screen
│   │   ├── todo.tsx           # ✅ Todo Screen
│   │   ├── syllabus.tsx       # 📚 Syllabus Screen
│   │   └── settings.tsx       # ⚙️ Settings Screen
│   ├── alarm/
│   │   └── new.tsx            # New Alarm Form
│   └── syllabus/
│       ├── add.tsx            # Add Subject
│       └── [id].tsx           # Subject Detail
├── constants/
│   └── theme.ts               # Colors, Fonts, Spacing
├── services/
│   ├── suariAI.ts             # AI API calls
│   └── alarmService.ts        # Alarm scheduling
├── store/
│   └── useAppStore.ts         # Global state (Zustand)
├── assets/
│   ├── fonts/                 # SpaceGrotesk fonts
│   ├── images/                # App icons
│   └── sounds/                # Alarm sounds
├── .github/workflows/
│   └── build-apk.yml          # Auto APK build
├── app.json                   # Expo config
├── eas.json                   # EAS Build config
└── package.json
```

---

## 🎨 Design System

- **Primary Color**: `#7C5CFC` (Cosmic Purple)
- **Accent Color**: `#FF6B9D` (Suari Pink)
- **Secondary**: `#00D4FF` (Cyan Glow)
- **Background**: `#080818` (Deep Space)
- **Font**: Space Grotesk

---

## 📞 Suari के साथ क्या कर सकते हैं?

| Command | Action |
|---------|--------|
| "Kal 6 baje alarm set karo" | Agent mode में alarm create होगा |
| "Math ki to-do list banao" | Todo tasks suggest करेगी |
| "Photosynthesis explain karo" | Research mode में detailed explanation |
| "Study plan banao" | Personalized study schedule |
| "Motivate karo!" | Motivational response |

---

## 🔒 Privacy

- सभी data आपके device पर stored है (AsyncStorage)
- AI conversations Experiential Labs API पर process होती हैं
- API key only आपके device पर stored है

---

Made with ❤️ for Suari Ka Alarm
