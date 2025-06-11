const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Paths
const CSV_PATH = path.join(process.cwd(), 'BẢNG GIÁ SHINE SHOP - HỌC TẬP & HIỆU SUẤT.csv');
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'store-data.json');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create backup
const timestamp = Date.now();
const backupPath = path.join(BACKUP_DIR, `store-backup-${timestamp}.json`);

// Read the current store data
const storeData = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
const currentProducts = storeData.products || [];

// Create a set of existing product slugs for quick lookup
const existingSlugs = new Set(currentProducts.map(product => product.slug));

// Read and parse the CSV file
const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
const csvRecords = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  from_line: 2, // Skip header row
});

// Process CSV data
const newProducts = [];

// Helper to convert to slug format
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// Filter out empty records (rows without a product name)
const validRecords = csvRecords.filter(record => record['SẢN PHẨM'] && record['SẢN PHẨM'].trim() !== '');

// Process each record
validRecords.forEach(record => {
  // Extract product name
  const productName = record['SẢN PHẨM'].trim();
  if (!productName) return; // Skip empty rows
  
  // Generate a slug from the product name
  const slug = toSlug(productName);
  
  // Skip if product already exists
  if (existingSlugs.has(slug)) {
    console.log(`Product "${productName}" already exists with slug "${slug}"`);
    return;
  }
  
  // Determine if it's an AI product or Education product
  let category = "Học tập";
  if (productName.includes('AI') || productName.includes('GPT') || 
      productName.includes('Claude') || productName.includes('Copilot') || 
      productName.includes('Perplexity') || productName.includes('Grok')) {
    category = "AI";
  }
  
  // Parse options from the CSV data
  const options = [];
  
  // Check if there's a package/plan column
  if (record['GÓI'] && record['GÓI'].trim()) {
    const packageOption = {
      id: Date.now().toString(),
      name: "",
      localizedName: {
        en: "Plan",
        vi: record['GÓI'].trim()
      },
      type: "select",
      values: []
    };
    
    // If there's a price, add it as an option value
    if (record['ĐƠN GIÁ'] && record['ĐƠN GIÁ'].trim()) {
      // Parse the price - remove non-numeric characters except for periods
      const priceText = record['ĐƠN GIÁ'].trim();
      const priceValue = priceText.replace(/[^0-9.]/g, '');
      const price = priceValue ? parseInt(priceValue, 10) : 0;
      
      packageOption.values.push({
        localizedValue: {
          en: record['GÓI'].trim(),
          vi: record['GÓI'].trim()
        },
        localizedPrice: {
          en: 0,
          vi: price
        },
        description: record['GHI CHÚ'] || ""
      });
    }
    
    if (packageOption.values.length > 0) {
      options.push(packageOption);
    }
  }
  
  // Create the new product
  const newProduct = {
    id: Date.now().toString() + Math.floor(Math.random() * 1000),
    name: slug,
    localizedName: {
      en: productName,
      vi: productName
    },
    price: 0,
    description: record['GHI CHÚ'] || "",
    localizedDescription: {
      en: record['GHI CHÚ'] || "",
      vi: record['GHI CHÚ'] || ""
    },
    image: "", // Images will be added later manually
    localizedCategory: {
      en: category === "AI" ? "AI" : "Education",
      vi: category
    },
    slug: slug,
    options: options,
    relatedArticles: [],
    sortOrder: currentProducts.length + newProducts.length + 1,
    isLocalized: true,
    tags: []
  };
  
  newProducts.push(newProduct);
  console.log(`Added new product: ${productName} (${slug})`);
});

// Backup the current data
fs.writeFileSync(backupPath, JSON.stringify(storeData, null, 2), 'utf-8');
console.log(`Created backup at: ${backupPath}`);

// Add new products to the store data
storeData.products = [...currentProducts, ...newProducts];

// Write the updated data back to the file
fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(storeData, null, 2), 'utf-8');
console.log(`Updated store data with ${newProducts.length} new products`); 