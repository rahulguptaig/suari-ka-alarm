const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Strange Alarm Mobile App/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace in Alerts
  content = content.replace(/Alert\.alert\('✅ (.*?)',/g, "Alert.alert('Success',");
  content = content.replace(/Alert\.alert\('⚠️ (.*?)',/g, "Alert.alert('Notice',");
  content = content.replace(/Alert\.alert\(`📅 (.*?)`,/g, "Alert.alert(`$1`,");
  
  // Replace in Headers/Titles
  content = content.replace(/⚙️ \{t\(language, 'settings_title'\)\}/g, "{t(language, 'settings_title')}");
  content = content.replace(/🌐 \{t\(language, 'language'\)\}/g, "{t(language, 'language')}");
  content = content.replace(/🤖 Suari AI Status/g, "Suari AI Status");
  content = content.replace(/ℹ️ App Info/g, "App Info");
  content = content.replace(/✨ Features/g, "Features");
  content = content.replace(/📝 To-Do List/g, "To-Do List");
  content = content.replace(/📚 Syllabus Tracker/g, "Syllabus Tracker");
  
  // Replace random emojis in texts
  content = content.replace(/Made with ❤️ for Suari Ka Alarm/g, "Made for Suari Ka Alarm");
  content = content.replace(/Suari 🌟/g, "Suari");
  content = content.replace(/available\. 🌟/g, "available.");
  content = content.replace(/Main Suari hoon 🌟/g, "Main Suari hoon.");
  content = content.replace(/❌ Error: /g, "Error: ");
  content = content.replace(/✏️ Tap to edit/g, "Tap to edit");
  content = content.replace(/💡 Tap karo status change karne ke liye: ○ → ⏳ → ✅/g, "Tap to change status: ○ -> In Progress -> Done");
  content = content.replace(/📅 Exam: /g, "Exam: ");
  content = content.replace(/📅 \{daysLeft > 0 \? `\$\{daysLeft\} days left` : 'Exam aaj!'\}/g, "{daysLeft > 0 ? `${daysLeft} days left` : 'Exam Today!'}");
  content = content.replace(/✅ \{new Date\(item\.completedAt\)\.toLocaleDateString\('hi-IN'\)\}/g, "{new Date(item.completedAt).toLocaleDateString('en-US')}");
  content = content.replace(/● Active/g, "Active");
  
  // Status badges in syllabus
  content = content.replace(/\{status\.label === 'Not Started' \? '—' : status\.label === 'In Progress' \? '⏳' : '✅'\}/g, "{status.label === 'Not Started' ? '—' : status.label === 'In Progress' ? 'In Progress' : 'Done'}");
  
  // Todo priorities
  content = content.replace(/\{ key: 'high', label: '🔴 High' \}/g, "{ key: 'high', label: 'High' }");
  content = content.replace(/\{ key: 'medium', label: '🟡 Medium' \}/g, "{ key: 'medium', label: 'Medium' }");
  content = content.replace(/\{ key: 'low', label: '🟢 Low' \}/g, "{ key: 'low', label: 'Low' }");
  
  // Alarms active/disabled
  content = content.replace(/\{localAlarm\.isEnabled \? '🟢 Active' : '⭕ Disabled'\}/g, "{localAlarm.isEnabled ? 'Active' : 'Disabled'}");
  
  // Alarm Next Time
  content = content.replace(/🔔 \{nextTime\}/g, "{nextTime}");
  
  // Settings Key
  content = content.replace(/🔑 \{apiKey \?/g, "{apiKey ?");

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Emojis stripped successfully using Node!');
