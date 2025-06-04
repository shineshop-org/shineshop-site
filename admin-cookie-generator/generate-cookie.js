const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Hằng số bảo mật - phải giống với những gì có trong app/lib/auth.ts
const ENCRYPTION_KEY = 'encKey-b9e25a8d-3c74-4f5a-9e12-f3b0e2dc4a19';
const ACCESS_COOKIE_NAME = 'shineshop_admin_access';
const COOKIE_NAME = 'shineshop_admin_auth';
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 giờ thay vì 30 ngày

// Output file paths
const OUTPUT_FILE = path.join(__dirname, 'admin_cookies.txt');
const OUTPUT_JSON_FILE = path.join(__dirname, 'admin_cookies.json');

// Hàm tạo token ngẫu nhiên
function getRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

// Hàm mã hóa AES tương tự CryptoJS.AES.encrypt
function aesEncrypt(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.slice(0, 32)), iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Hàm tạo hmac SHA256 tương tự CryptoJS.HmacSHA256
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

// Tạo đối tượng JSON chứa thông tin cookie
const cookiesJson = {
  cookies: [
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
  ],
  generatedAt: new Date().toISOString(),
  expiresAt: expiryDate.toISOString()
};

// Lưu thông tin cookie vào file JSON
fs.writeFileSync(OUTPUT_JSON_FILE, JSON.stringify(cookiesJson, null, 2), 'utf8');

// Lưu thông tin cookie vào file văn bản thông thường để dễ đọc
const txtContent = `=== COOKIE ADMIN ĐƯỢC TẠO THÀNH CÔNG ===
Thời gian tạo: ${new Date().toLocaleString()}
Thời gian hết hạn: ${expiryDate.toLocaleString()}

1. Cookie ${ACCESS_COOKIE_NAME}:
${accessToken}

2. Cookie ${COOKIE_NAME}:
${specialToken}

Hướng dẫn thiết lập cookie:
- Mở DevTools (F12) > Application > Cookies
- Thêm cookie với tên và giá trị trên
- Đặt domain thành tên miền của trang web
- Đặt Path thành "/"
- Cookie có thời hạn 24 giờ kể từ khi tạo
- Làm mới trang và thử truy cập /admin
`;

fs.writeFileSync(OUTPUT_FILE, txtContent, 'utf8');

console.log('\n=== COOKIE ADMIN ĐƯỢC TẠO THÀNH CÔNG ===\n');
console.log(`Thời gian tạo: ${new Date().toLocaleString()}`);
console.log(`Thời gian hết hạn: ${expiryDate.toLocaleString()}`);
console.log('\nCác cookie đã được lưu vào:');
console.log(`- File JSON: ${OUTPUT_JSON_FILE}`);
console.log(`- File text: ${OUTPUT_FILE}`);
console.log('\nHướng dẫn thiết lập cookie:');
console.log('- Mở DevTools (F12) > Application > Cookies');
console.log('- Thêm cookie với tên và giá trị trong file');
console.log('- Đặt domain thành tên miền của trang web');
console.log('- Đặt Path thành "/"');
console.log('- Cookie có thời hạn 24 giờ kể từ khi tạo');
console.log('- Làm mới trang và thử truy cập /admin'); 