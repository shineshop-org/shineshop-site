# Công cụ tạo cookie admin an toàn

Đây là công cụ để tạo cookie đặc biệt cần thiết để truy cập trang admin của ShineShop.

## Lý do cần cookie đặc biệt

Trang admin được bảo vệ bằng hai lớp cookie:

1. `shineshop_admin_access` - Cookie đặc biệt để kích hoạt trang admin (nếu không có cookie này, trang admin sẽ trả về 404)
2. `shineshop_admin_auth` - Cookie xác thực để duy trì phiên đăng nhập

Cookie đặc biệt cần được tạo một cách bảo mật và không nên được tạo trực tiếp trên trang web để tránh việc người dùng có thể phát hiện.

## Tính năng bảo mật

- Cookie có thời hạn ngắn (24 giờ)
- Rate limiting chống brute force (giới hạn số lần thử truy cập)
- Mã hóa dữ liệu cookie với AES-256
- Xác thực tính toàn vẹn của cookie bằng HMAC-SHA256
- Đánh dấu thời gian tạo và hết hạn

## Cách sử dụng

### 1. Tạo cookie dạng JSON và text

```
node generate-cookie.js
```

Script này sẽ:
- Tạo cookie mới với thời hạn 24 giờ
- Lưu thông tin cookie vào file `admin_cookies.json` (định dạng JSON)
- Lưu thông tin cookie vào file `admin_cookies.txt` (định dạng text)
- Hiển thị thông tin chi tiết về cookie và hướng dẫn sử dụng

### 2. Tạo file cookie Netscape (phương pháp khuyên dùng)

```
node generate-cookie-file.js
```

Script này sẽ:
1. Yêu cầu bạn nhập tên miền (vd: localhost, example.com)
2. Hỏi bạn có sử dụng secure cookie không (chọn Y nếu trang web HTTPS)
3. Tạo file cookie Netscape có thể import vào trình duyệt
4. Lưu vào file `admin_cookies_netscape.txt`

### Cách import file cookie

#### Chrome
1. Cài đặt tiện ích "EditThisCookie" hoặc tương tự
2. Trong tiện ích, chọn "Import" và dán nội dung file cookie

#### Firefox
1. Cài đặt tiện ích "Cookie Quick Manager"
2. Trong tiện ích, chọn "Import" và chọn file cookie đã tạo

#### Edge
1. Cài đặt tiện ích "EditThisCookie" hoặc tương tự
2. Trong tiện ích, chọn "Import" và dán nội dung file cookie

## Lưu ý bảo mật

- **Thời hạn cookie**: Tất cả cookie đều hết hạn sau 24 giờ và cần được tạo lại
- **Cookie cá nhân**: Không chia sẻ các file cookie hoặc giá trị cookie với người khác
- **Bảo vệ tệp**: Các tệp cookie được tạo ra chứa thông tin xác thực và cần được bảo vệ
- **Rate limiting**: Hệ thống sẽ tự động chặn các IP cố gắng truy cập admin quá nhiều lần
- **404 Response**: Nếu cookie không hợp lệ hoặc không tồn tại, trang admin sẽ trả về 404

## Quy trình làm việc khuyến nghị

1. Tạo cookie mới mỗi ngày làm việc
2. Import cookie vào trình duyệt khi bắt đầu phiên làm việc
3. Xóa các tệp cookie sau khi không còn cần nữa
4. Không bao giờ để cookie được lưu trên máy tính công cộng

## Khắc phục sự cố

Nếu bạn không thể truy cập trang admin sau khi thêm cookie:
1. Đảm bảo cookie chưa hết hạn (tạo cookie mới)
2. Kiểm tra domain của cookie có đúng không
3. Đảm bảo đã đặt path là "/"
4. Làm mới trang sau khi thêm cookie 