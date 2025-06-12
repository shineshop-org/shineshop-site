param(
    [string]$filePath = "C:\Users\Administrator\Documents\shineshop-site\app\admin\dashboard\page.tsx"
)

# Tạo backup file
$backupPath = "$filePath.bak"
Copy-Item -Path $filePath -Destination $backupPath -Force
Write-Host "Created backup at $backupPath"

# Đọc nội dung file
$content = Get-Content -Path $filePath -Raw

# Tìm và thay thế dòng "const [showNotification, setShowNotification] = useState(false)" thành 
# "const [showSavedNotification, setShowSavedNotification] = useState(false)"
$content = $content -replace 'const \[showNotification, setShowNotification\] = useState\(false\)', 'const [showSavedNotification, setShowSavedNotification] = useState(false)'

# Tìm và xóa dòng "// Add showSavedNotification state back" và dòng khai báo sau nó
$pattern = '// Add showSavedNotification state back\s+const \[showSavedNotification, setShowSavedNotification\] = useState\(false\)'
$content = $content -replace $pattern, ''

# Thêm hàm handleSaveFaq nếu chưa có
if (-not ($content -match 'const handleSaveFaq')) {
    $handleSaveFaqFunc = @"

	// Function to save FAQ changes
	const handleSaveFaq = () => {
		// Show save notification
		setShowSavedNotification(true)
		// Hide notification after 3 seconds
		setTimeout(() => {
			setShowSavedNotification(false)
		}, 3000)
	}
"@
    
    # Thêm hàm trước rebuildInitialData
    $content = $content -replace '(// Thêm hàm rebuildInitialData mới)', "$handleSaveFaqFunc`n`n`t$1"
}

# Ghi nội dung đã sửa vào file
Set-Content -Path $filePath -Value $content
Write-Host "Fixed file at $filePath" 