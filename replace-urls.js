const fs = require('fs');
const path = require('path');

const targetDir = __dirname; 
const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx'];

function replaceUrlsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    const doubleQuoteRegex = /"http:\/\/localhost:5000([^"]*)"/g;
    const singleQuoteRegex = /'http:\/\/localhost:5000([^']*)'/g;
    const backtickRegex = /`http:\/\/localhost:5000([^`]*)`/g;

    // Chỉ giữ duy nhất biến process.env.NEXT_PUBLIC_API_URL
    const replacement = "`${process.env.NEXT_PUBLIC_API_URL}$1`";

    const updatedContent = content
      .replace(doubleQuoteRegex, replacement)
      .replace(singleQuoteRegex, replacement)
      .replace(backtickRegex, replacement);

    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Đã cập nhật: ${path.relative(__dirname, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Lỗi khi xử lý file ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git' && file !== 'out') {
        walkDir(fullPath);
      }
    } else if (allowedExtensions.includes(path.extname(fullPath))) {
      if (file !== 'replace-urls.js') {
        replaceUrlsInFile(fullPath);
      }
    }
  }
}

console.log('🚀 Đang quét và thay thế URL trong thư mục frontend...');
walkDir(targetDir);
console.log('🎉 Hoàn tất!');