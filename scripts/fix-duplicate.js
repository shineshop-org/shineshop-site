const fs = require('fs');
const path = require('path');

// Đường dẫn đến file cần sửa
const filePath = path.join(__dirname, '..', 'app', 'admin', 'dashboard', 'page.tsx');
const backupPath = filePath + '.bak';
const fixedPath = filePath + '.fixed';

try {
  // Đọc nội dung file
  console.log('Đọc file:', filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Tạo backup
  fs.writeFileSync(backupPath, content);
  console.log('Đã tạo bản sao:', backupPath);
  
  // Tìm và xóa dòng khai báo trùng lặp
  content = content.replace(
    /\/\/ Add showSavedNotification state back\r?\n\tconst \[showSavedNotification, setShowSavedNotification\] = useState\(false\)/g, 
    ''
  );
  
  // Ghi vào file fixed
  fs.writeFileSync(fixedPath, content);
  console.log('Đã tạo file sửa lỗi:', fixedPath);
  
  // Thay thế file gốc
  fs.copyFileSync(fixedPath, filePath);
  console.log('Đã thay thế file gốc thành công');
  
  console.log('Quá trình sửa lỗi hoàn tất');
} catch (error) {
  console.error('Lỗi:', error.message);
} 