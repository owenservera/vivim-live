const fs = require('fs');
const path = require('path');

// Arabic-Indic to Western numeral mapping
const arabicToWestern = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
};

function convertArabicNumerals(str) {
  return str.replace(/[٠-٩]/g, match => arabicToWestern[match]);
}

const arFilePath = path.join(__dirname, 'src', 'messages', 'ar', 'index.json');
const arFileContent = fs.readFileSync(arFilePath, 'utf8');
const convertedContent = convertArabicNumerals(arFileContent);
fs.writeFileSync(arFilePath, convertedContent, 'utf8');

console.log('✓ Fixed Arabic numerals in src/messages/ar/index.json');

// Also fix the copy in packages/frontend/src/messages/ar/index.json
const arFrontendPath = path.join(__dirname, 'packages', 'frontend', 'src', 'messages', 'ar', 'index.json');
if (fs.existsSync(arFrontendPath)) {
  const arFrontendContent = fs.readFileSync(arFrontendPath, 'utf8');
  const convertedFrontendContent = convertArabicNumerals(arFrontendContent);
  fs.writeFileSync(arFrontendPath, convertedFrontendContent, 'utf8');
  console.log('✓ Fixed Arabic numerals in packages/frontend/src/messages/ar/index.json');
}

console.log('Done!');
