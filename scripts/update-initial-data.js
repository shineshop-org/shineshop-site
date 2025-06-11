import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Paths
  const STORE_DATA_PATH = path.join(path.dirname(__dirname), 'data', 'store-data.json');
  const INITIAL_DATA_PATH = path.join(path.dirname(__dirname), 'app', 'lib', 'initial-data.ts');
  const BACKUP_DIR = path.join(path.dirname(__dirname), 'data', 'backups');

  console.log('Store data path:', STORE_DATA_PATH);
  console.log('Initial data path:', INITIAL_DATA_PATH);

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Create backup of initial-data.ts
  const timestamp = Date.now();
  const backupPath = path.join(BACKUP_DIR, `initial-data-backup-${timestamp}.ts`);

  // Read the current files
  console.log('Reading initial-data.ts...');
  const initialDataContent = fs.readFileSync(INITIAL_DATA_PATH, 'utf-8');

  console.log('Creating backup of initial-data.ts...');
  fs.writeFileSync(backupPath, initialDataContent, 'utf-8');
  console.log(`Backup created at: ${backupPath}`);

  console.log('Reading store-data.json...');
  const storeData = JSON.parse(fs.readFileSync(STORE_DATA_PATH, 'utf-8'));
  const products = storeData.products || [];

  console.log(`Found ${products.length} products in store-data.json`);

  // Cập nhật phần initialProducts trong initial-data.ts
  const productsString = JSON.stringify(products, null, 2)
    .replace(/\n/g, '\n  ') // Đảm bảo định dạng đúng
    .replace(/\}\]/g, '  }]');

  // Tạo chuỗi mới cho initialProducts
  const newInitialProductsText = `export const initialProducts: Product[] = ${productsString};`;

  // Tìm và thay thế phần initialProducts trong initial-data.ts
  const initialProductsRegex = /export const initialProducts: Product\[\] = \[([\s\S]*?)\];/;

  if (initialProductsRegex.test(initialDataContent)) {
    console.log('Replacing initialProducts in initial-data.ts...');
    const updatedContent = initialDataContent.replace(initialProductsRegex, newInitialProductsText);
    
    // Ghi lại file initial-data.ts với nội dung đã cập nhật
    fs.writeFileSync(INITIAL_DATA_PATH, updatedContent, 'utf-8');
    console.log('initial-data.ts updated successfully!');
  } else {
    console.error('Could not find initialProducts section in initial-data.ts');
    process.exit(1);
  }

  // Cập nhật dataVersion
  console.log('Updating dataVersion...');
  const dataVersionRegex = /export const dataVersion = (\d+);/;
  const dataVersionMatch = initialDataContent.match(dataVersionRegex);

  if (dataVersionMatch) {
    const currentVersion = parseInt(dataVersionMatch[1], 10);
    const newVersion = currentVersion + 1;
    
    const updatedContent = fs.readFileSync(INITIAL_DATA_PATH, 'utf-8')
      .replace(dataVersionRegex, `export const dataVersion = ${newVersion};`);
    
    fs.writeFileSync(INITIAL_DATA_PATH, updatedContent, 'utf-8');
    console.log(`dataVersion updated from ${currentVersion} to ${newVersion}`);
  } else {
    console.warn('Could not find dataVersion in initial-data.ts');
  }

  console.log('Done! Please restart the development server to see the changes.');
} catch (error) {
  console.error('Error updating initial-data.ts:', error);
} 