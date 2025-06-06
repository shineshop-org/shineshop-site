# Hệ thống lưu trữ dữ liệu vĩnh viễn

## Tổng quan

Hệ thống lưu trữ dữ liệu đã được nâng cấp để đảm bảo dữ liệu được lưu trữ vĩnh viễn trên server thay vì chỉ trong localStorage của từng trình duyệt. Điều này đảm bảo:

- Dữ liệu được chia sẻ giữa tất cả các trình duyệt
- Dữ liệu không bị mất khi xóa cache trình duyệt
- Dữ liệu được backup tự động

## Cách hoạt động

### 1. Lưu trữ trên Server
- Dữ liệu được lưu trong file `data/store-data.json` trên server
- Mỗi lần thay đổi dữ liệu, hệ thống tự động lưu lên server
- Tự động tạo backup với timestamp (giữ lại 5 backup gần nhất)

### 2. API Endpoints
- `GET /api/store-data`: Đọc dữ liệu từ server
- `POST /api/store-data`: Lưu dữ liệu lên server

### 3. Đồng bộ tự động
- Khi mở trang web, dữ liệu tự động được load từ server
- Dữ liệu tự động đồng bộ mỗi 30 giây
- Khi chuyển tab/trình duyệt, dữ liệu được reload

### 4. LocalStorage (Backup)
- Dữ liệu vẫn được lưu trong localStorage để truy cập nhanh
- LocalStorage chỉ là bản sao, không phải nguồn chính

## Lưu ý khi deploy

### Cloudflare Pages
Khi deploy lên Cloudflare Pages, file system là read-only. Cần sử dụng:
- Cloudflare KV Storage
- Cloudflare D1 Database
- External database

### Development
Trong môi trường development, dữ liệu được lưu trực tiếp vào file system.

## Cấu trúc dữ liệu

```json
{
  "products": [...],
  "faqArticles": [...],
  "socialLinks": [...],
  "paymentInfo": {...},
  "siteConfig": {...},
  "tosContent": "...",
  "language": "vi",
  "theme": "light"
}
```

## Backup
- Backup tự động được tạo với format: `store-backup-{timestamp}.json`
- Giữ lại 5 backup gần nhất
- Backup được lưu trong thư mục `data/` 