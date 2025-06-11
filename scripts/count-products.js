import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the store data file
const DATA_FILE_PATH = path.join(path.dirname(__dirname), 'data', 'store-data.json');

// Read and parse the JSON file
const storeData = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));

// Count and log the products
const productCount = storeData.products.length;
console.log(`Total products in store: ${productCount}`);

// List the products
console.log('\nProducts:');
storeData.products.forEach((product, index) => {
  console.log(`${index + 1}. ${product.localizedName.vi} (${product.slug})`);
}); 