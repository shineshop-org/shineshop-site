const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Hằng số bảo mật - phải giống với những gì có trong app/lib/auth.ts
const ENCRYPTION_KEY = 'encKey-b9e25a8d-3c74-4f5a-9e12-f3b0e2dc4a19';
const ACCESS_COOKIE_NAME = 'shineshop_admin_access';
const COOKIE_NAME = 'shineshop_admin_auth';
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 giờ

// Output file path
const OUTPUT_COOKIE_EDITOR_FILE = path.join(__dirname, 'admin-cookies.json');

// Hàm tạo token ngẫu nhiên
function getRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

// Hàm mã hóa AES
function aesEncrypt(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.slice(0, 32)), iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Hàm tạo hmac SHA256
function hmacSha256(data, key) {
  return crypto
    .createHmac('sha256', key)
    .update(data)
    .digest('hex');
}

// Tạo access token
function generateAccessToken() {
  const timestamp = new Date().getTime();
  const uniqueId = getRandomString(20);
  
  const payload = {
    accessKey: true,
    timestamp,
    uniqueId,
    signature: hmacSha256(`${timestamp}:${uniqueId}`, ENCRYPTION_KEY)
  };
  
  return aesEncrypt(JSON.stringify(payload), ENCRYPTION_KEY);
}

// Tạo special token
function generateSpecialToken() {
  const timestamp = new Date().getTime();
  const payload = {
    admin: true,
    timestamp,
    special: 'shineshop-secure'
  };
  
  return aesEncrypt(JSON.stringify(payload), ENCRYPTION_KEY);
}

// Tạo cookie
const accessToken = generateAccessToken();
const specialToken = generateSpecialToken();
const expiryDate = new Date(Date.now() + COOKIE_MAX_AGE * 1000);

// Tạo mảng các cookie cho Cookie-Editor
const cookiesArray = [
  {
    name: ACCESS_COOKIE_NAME,
    value: accessToken,
    domain: "",
    path: "/",
    expires: expiryDate.toISOString(),
    maxAge: COOKIE_MAX_AGE,
    secure: false,
    httpOnly: false,
    sameSite: "strict"
  },
  {
    name: COOKIE_NAME,
    value: specialToken,
    domain: "",
    path: "/",
    expires: expiryDate.toISOString(),
    maxAge: COOKIE_MAX_AGE,
    secure: false,
    httpOnly: false,
    sameSite: "strict"
  }
];

// Lưu mảng cookies vào file JSON cho Cookie-Editor
fs.writeFileSync(OUTPUT_COOKIE_EDITOR_FILE, JSON.stringify(cookiesArray, null, 2), 'utf8');

console.log('\n=== COOKIE ADMIN ĐÃ TẠO THÀNH CÔNG ===\n');
console.log(`Thời gian tạo: ${new Date().toLocaleString()}`);
console.log(`Thời gian hết hạn: ${expiryDate.toLocaleString()}`);
console.log(`\nĐã lưu vào file: ${OUTPUT_COOKIE_EDITOR_FILE}`);
console.log('\nHướng dẫn sử dụng:');
console.log('1. Mở Chrome Extension Cookie-Editor');
console.log('2. Chọn Import và dán nội dung file trên');
console.log('3. Sau khi import thành công, làm mới trang và truy cập /admin'); 