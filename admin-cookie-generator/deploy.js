const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Đường dẫn tới thư mục gốc dự án
const rootDir = path.resolve(__dirname, '..');

// Hàm thực thi lệnh shell và trả về Promise
function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command}`);
    exec(command, { cwd: rootDir, ...options }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        console.error(`Error output: ${stderr}`);
        return reject(error);
      }
      
      console.log(stdout);
      resolve(stdout);
    });
  });
}

// Kiểm tra trạng thái git
async function checkGitStatus() {
  try {
    const statusOutput = await execCommand('git status --porcelain');
    if (!statusOutput.trim()) {
      console.log('No changes to commit.');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking git status:', error);
    throw error;
  }
}

// Kiểm tra xem git repo đã được khởi tạo hay chưa
async function checkGitRepo() {
  try {
    await execCommand('git rev-parse --is-inside-work-tree');
    return true;
  } catch (error) {
    return false;
  }
}

// Tạo commit message theo chuẩn Conventional Commit
function generateCommitMessage() {
  const types = ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'perf', 'test'];
  const type = types[Math.floor(Math.random() * 3)]; // Chọn một trong 3 loại commit phổ biến nhất
  
  const messages = {
    feat: [
      'thêm tính năng bảo mật nâng cao cho admin',
      'cập nhật hệ thống cookie admin với thời hạn 24 giờ',
      'triển khai rate limiting cho trang admin'
    ],
    fix: [
      'sửa lỗi xác thực cookie admin',
      'khắc phục vấn đề truy cập vào trang admin',
      'cải thiện bảo mật cho middleware'
    ],
    chore: [
      'cập nhật tài liệu hướng dẫn quản trị',
      'tối ưu hóa quy trình tạo cookie admin',
      'dọn dẹp mã nguồn và cải thiện cấu trúc'
    ]
  };
  
  const messageArray = messages[type] || messages.chore;
  const message = messageArray[Math.floor(Math.random() * messageArray.length)];
  
  return `${type}: ${message}`;
}

// Kiểm tra kết nối remote
async function checkRemote() {
  try {
    await execCommand('git remote -v');
    return true;
  } catch (error) {
    return false;
  }
}

// Tất cả các bước
async function deploy() {
  try {
    console.log('=== Tự động deploy lên Cloudflare ===');
    
    // Kiểm tra git repo
    const isGitRepo = await checkGitRepo();
    if (!isGitRepo) {
      throw new Error('Không phải git repository. Vui lòng khởi tạo git repository trước.');
    }
    
    // Kiểm tra remote
    const hasRemote = await checkRemote();
    if (!hasRemote) {
      throw new Error('Không tìm thấy git remote. Vui lòng thiết lập remote trước khi deploy.');
    }
    
    // Kiểm tra thay đổi
    const hasChanges = await checkGitStatus();
    if (!hasChanges) {
      console.log('Không có thay đổi nào để commit.');
      return;
    }
    
    // Add tất cả các thay đổi
    await execCommand('git add -A');
    
    // Tạo commit message
    const commitMessage = generateCommitMessage();
    await execCommand(`git commit -m "${commitMessage}"`);
    
    // Push lên remote
    console.log('Đang push lên Cloudflare...');
    await execCommand('git push');
    
    console.log('\n=== Deploy thành công! ===');
    console.log('Cloudflare sẽ tự động build và triển khai trang web.');
    console.log('Commit message:', commitMessage);
  } catch (error) {
    console.error('\n=== Deploy thất bại! ===');
    console.error('Chi tiết lỗi:', error.message);
  }
}

// Thực thi deploy
deploy().catch(console.error); 