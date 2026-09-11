import fs from 'fs';

const filePath = 'd:\\VeloLaunch\\FinAura - Personal AI - Powered Finance Vault\\FinAura-AI-Finance-Vault\\Landing_Page_Final\\src\\LandingPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const newFeatures = `              { icon: <QrCode className="w-6 h-6" />, title: 'Pay & Record', desc: 'Scan UPI QR codes, securely record payments in your vault, and keep track of intents instantly.', color: '#f97316', bg: '#ffedd5' },
              { icon: <Download className="w-6 h-6" />, title: 'Offline Backup & Export', desc: 'Export your entire vault as an encrypted JSON file for safekeeping.', color: '#0ea5e9', bg: '#e0f2fe' },
              { icon: <Bell className="w-6 h-6" />, title: 'Smart Notifications', desc: 'Get reminded of upcoming bills and credit card due dates before you miss them.', color: '#f43f5e', bg: '#ffe4e6' },
              { icon: <CloudOff className="w-6 h-6" />, title: 'Daily Backup Reminders', desc: 'Never lose data again. Get smart daily reminders to export your encrypted vault.', color: '#14b8a6', bg: '#ccfbf1' },
`;

// Insert after FinAura AI Assistant
const target = "{ icon: <Sparkles className=\"w-6 h-6\" />, title: 'FinAura AI Assistant', desc: 'Log expenses naturally by chatting. Connects directly to Gemini, Groq, or OpenRouter with your local API key for absolute privacy.', color: '#10b981', bg: '#D1FAE5' },";

if (content.includes(target)) {
    content = content.replace(target, target + '\n' + newFeatures);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully patched features in LandingPage.jsx');
} else {
    console.error('Target not found in file!');
}
