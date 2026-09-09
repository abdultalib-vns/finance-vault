import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, 'index.css');

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
if (lines.length > 11630) {
  const newContent = lines.slice(0, 11630).join('\n');
  fs.writeFileSync(file, newContent);
  console.log('Truncated to 11630 lines.');
} else {
  console.log('File is already smaller than 11630 lines.');
}
