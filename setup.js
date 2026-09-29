/**
 * Suari Ka Alarm - Setup Script
 * Run: node setup.js
 * Downloads fonts and prepares the project for Expo
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, 'assets', 'fonts');

// Google Fonts CDN direct links for Space Grotesk
const FONTS = [
  {
    name: 'SpaceGrotesk-Regular.ttf',
    url: 'https://fonts.gstatic.com/s/spacegrotesk/v15/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gozuPTPDg.woff2',
    iswoff2: true
  },
  {
    name: 'SpaceGrotesk-Medium.ttf', 
    url: 'https://fonts.gstatic.com/s/spacegrotesk/v15/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gozuPTPDg.woff2',
    iswoff2: true
  },
  {
    name: 'SpaceGrotesk-SemiBold.ttf',
    url: 'https://fonts.gstatic.com/s/spacegrotesk/v15/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gozuPTPDg.woff2',
    iswoff2: true
  },
  {
    name: 'SpaceGrotesk-Bold.ttf',
    url: 'https://fonts.gstatic.com/s/spacegrotesk/v15/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gozuPTPDg.woff2',
    iswoff2: true
  },
];

console.log('\n🚀 Suari Ka Alarm - Setup Script\n');
console.log('='.repeat(50));

// Create directories
[FONTS_DIR, path.join(__dirname, 'assets', 'sounds'), path.join(__dirname, 'assets', 'images')].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  }
});

console.log('\n📝 Instructions:\n');
console.log('1. FONTS: Space Grotesk download karo:');
console.log('   👉 https://fonts.google.com/specimen/Space+Grotesk');
console.log('   "Download Family" click karo → Extract → assets/fonts/ mein daalo\n');

console.log('2. ICONS: Icon generator kholo:');
console.log('   👉 File: assets/images/generate-icons.html');
console.log('   Browser mein open karo → sabhi icons download karo → assets/images/ mein daalo\n');

console.log('3. API KEY: Experiential Labs se lelo:');
console.log('   👉 https://experientiallabs.ai');
console.log('   App > Settings > API Key mein paste karo\n');

console.log('4. EXPO TESTING (Expo Go se):');
console.log('   👉 npm install');
console.log('   👉 npx expo start');
console.log('   QR code scan karo Expo Go app se (Android/iOS)\n');

console.log('5. APK BUILD:');
console.log('   👉 npm install -g eas-cli');
console.log('   👉 eas login');
console.log('   👉 eas build --platform android --profile preview\n');

console.log('='.repeat(50));
console.log('\n🌟 Suari ready hai! Enjoy!\n');
