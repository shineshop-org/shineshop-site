# Hướng Dẫn Quản Trị Trang Admin

## Thông Tin Đăng Nhập

Để truy cập trang admin, sử dụng thông tin đăng nhập sau:

- **Tên đăng nhập:** admin
- **Mật khẩu:** shineshop2024

## Truy Cập Trang Admin

### Cách 1: Đăng nhập thông thường

1. Truy cập trang `/admin`
2. Nhập tên đăng nhập và mật khẩu
3. Nhấn "Đăng nhập"

### Cách 2: Sử dụng token đặc biệt

1. Truy cập trang `/admin`
2. Chuyển sang tab "Nâng cao"
3. Nhập token đặc biệt vào ô "Token đặc biệt"
4. Nhấn "Xác thực bằng token"

### Cách 3: Sử dụng script truy cập

1. Truy cập bất kỳ trang nào của website
2. Mở Console trình duyệt (F12 > Console)
3. Dán đoạn script bạn đã sao chép từ trang admin > Thông tin bảo mật > "Sao chép script"
4. Nhấn Enter để chạy script
5. Sau đó truy cập trang `/admin/dashboard`

## Các Tính Năng Quản Trị

### Quản Lý Sản Phẩm

- **Thêm sản phẩm:** Nhấn nút "Add Product"
- **Chỉnh sửa sản phẩm:** Nhấn nút "Edit" trên sản phẩm
- **Xóa sản phẩm:** Nhấn nút "Delete" trên sản phẩm và xác nhận

### Quản Lý FAQ

- **Thêm FAQ:** Nhấn nút "Add FAQ"
- **Chỉnh sửa FAQ:** Nhấn nút "Edit" trên FAQ
- **Xóa FAQ:** Nhấn nút "Delete" trên FAQ và xác nhận

### Quản Lý Cài Đặt

- **Thay đổi nội dung hero:** Chỉnh sửa tiêu đề và trích dẫn
- **Thay đổi liên kết mạng xã hội:** Cập nhật link Facebook và WhatsApp
- **Thay đổi thông tin thanh toán:** Cập nhật thông tin ngân hàng, Wise, PayPal
- **Thay đổi điều khoản sử dụng:** Chỉnh sửa nội dung TOS

## Cơ Chế Bảo Mật

Hệ thống sử dụng nhiều lớp bảo mật:

1. **Xác thực mật khẩu:** Kiểm tra tên đăng nhập và mật khẩu
2. **Cookie bảo mật:** Lưu token được mã hóa trong cookie để duy trì phiên đăng nhập
3. **Header đặc biệt:** Yêu cầu header đặc biệt trong môi trường sản xuất
4. **Token mã hóa:** Sử dụng mã hóa AES và JWT cho token xác thực
5. **Thời gian hết hạn:** Cookie và token có thời gian sống giới hạn (30 ngày)

## Đăng Xuất

Để đăng xuất khỏi trang admin, nhấn nút "Đăng xuất" ở góc trên bên phải của trang dashboard. Điều này sẽ xóa cookie xác thực và chuyển hướng bạn về trang đăng nhập.

## Khắc Phục Sự Cố

Nếu bạn gặp vấn đề khi truy cập trang admin:

1. Kiểm tra xem bạn đã nhập đúng thông tin đăng nhập chưa
2. Xóa cookie và thử đăng nhập lại
3. Sử dụng script truy cập để thiết lập lại header và cookie
4. Chỉ sử dụng trang admin trên thiết bị cá nhân đáng tin cậy

## Lưu Ý Quan Trọng

- **Bảo mật thông tin đăng nhập:** Không chia sẻ thông tin đăng nhập với người không có trách nhiệm
- **Sử dụng HTTPS:** Luôn sử dụng kết nối HTTPS để đảm bảo an toàn
- **Đăng xuất khi không sử dụng:** Đảm bảo đăng xuất khi rời khỏi trang admin
- **Thay đổi mật khẩu định kỳ:** Để tăng cường bảo mật 