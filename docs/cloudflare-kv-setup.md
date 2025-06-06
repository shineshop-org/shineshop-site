# Hướng dẫn cấu hình Cloudflare KV Storage

## Tạo KV Namespace

### 1. Qua Cloudflare Dashboard
1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Chọn account của bạn
3. Vào Workers & Pages > KV
4. Click "Create namespace"
5. Đặt tên: `shineshop-store-kv`
6. Copy ID của namespace

### 2. Qua Wrangler CLI
```bash
# Tạo namespace cho production
wrangler kv:namespace create "STORE_KV"

# Tạo namespace cho preview/development
wrangler kv:namespace create "STORE_KV" --preview
```

## Cập nhật wrangler.toml

Thay thế ID trong wrangler.toml với ID thực tế:
```toml
[[kv_namespaces]]
binding = "STORE_KV"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_PREVIEW_KV_NAMESPACE_ID"
```

## Binding KV với Pages

### Qua Dashboard
1. Vào Workers & Pages > chọn project "shineshop-site"
2. Settings > Functions > KV namespace bindings
3. Add binding:
   - Variable name: `STORE_KV`
   - KV namespace: chọn `shineshop-store-kv`

### Qua wrangler.json (alternative)
```json
{
  "name": "shineshop-site",
  "kv_namespaces": [
    {
      "binding": "STORE_KV",
      "id": "YOUR_KV_NAMESPACE_ID"
    }
  ]
}
```

## Test KV Storage

1. Deploy lên Cloudflare Pages
2. Truy cập `/admin/dashboard` 
3. Thêm/sửa sản phẩm
4. Mở trình duyệt khác và kiểm tra dữ liệu đã được đồng bộ

## Xem dữ liệu trong KV

### Qua Dashboard
1. Workers & Pages > KV
2. Chọn namespace `shineshop-store-kv`
3. Xem key `store-data`

### Qua Wrangler CLI
```bash
# List all keys
wrangler kv:key list --namespace-id=YOUR_KV_NAMESPACE_ID

# Get specific key
wrangler kv:key get "store-data" --namespace-id=YOUR_KV_NAMESPACE_ID
```

## Backup/Restore

### Export data
```bash
wrangler kv:key get "store-data" --namespace-id=YOUR_KV_NAMESPACE_ID > backup.json
```

### Import data
```bash
wrangler kv:key put "store-data" --namespace-id=YOUR_KV_NAMESPACE_ID < backup.json
```

## Lưu ý
- KV có độ trễ (~60s) để đồng bộ globally
- Giới hạn: 1MB per value, 1000 operations/day (free plan)
- Backup tự động được lưu với prefix `store-backup-` 