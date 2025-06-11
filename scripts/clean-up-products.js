import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const DATA_FILE_PATH = path.join(path.dirname(__dirname), 'data', 'store-data.json');
const BACKUP_DIR = path.join(path.dirname(__dirname), 'data', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create backup
const timestamp = Date.now();
const backupPath = path.join(BACKUP_DIR, `store-backup-${timestamp}.json`);

// Read the current store data
const storeData = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
const products = storeData.products || [];

console.log(`Before cleanup: ${products.length} products`);

// Find and remove the SẢN PHẨM product
const cleanedProducts = products.filter(product => product.slug !== 'sn-phm');

console.log(`After cleanup: ${cleanedProducts.length} products`);
console.log(`Removed ${products.length - cleanedProducts.length} products`);

// Backup the current data
fs.writeFileSync(backupPath, JSON.stringify(storeData, null, 2), 'utf-8');
console.log(`Created backup at: ${backupPath}`);

// Update the store data with the cleaned products
storeData.products = cleanedProducts;

// Write the updated data back to the file
fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(storeData, null, 2), 'utf-8');
console.log(`Updated store data file`);

// List the remaining products
console.log('\nRemaining Products:');
storeData.products.forEach((product, index) => {
  console.log(`${index + 1}. ${product.localizedName.vi} (${product.slug})`);
}); 