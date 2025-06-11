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
  columns: false, // Don't automatically convert to objects with headers
  skip_empty_lines: true,
});

// Get headers from the second row (index 1)
const headers = csvRecords[1];

// Process CSV data
const newProducts = [];
const updatedProducts = [];

// Helper to convert to slug format
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// Helper to extract price as a number
function extractPrice(priceStr) {
  if (!priceStr) return 0;
  
  // Remove currency symbols and commas
  const numericPart = priceStr.replace(/[^0-9]/g, '');
  return numericPart ? parseInt(numericPart, 10) : 0;
}

// Create a map of existing products by slug for easy lookup
const productMap = {};
currentProducts.forEach(product => {
  productMap[product.slug] = product;
});

// Process each row in the CSV (starting from row 3, index 2)
for (let i = 2; i < csvRecords.length; i++) {
  const row = csvRecords[i];
  
  // Skip empty rows or rows without a product name
  if (!row[0] || row[0].trim() === '') {
    continue;
  }
  
  // Extract the product name from the first column
  const productName = row[0].trim();
  
  // Generate a slug from the product name
  const baseSlug = toSlug(productName);
  let slug = baseSlug;
  
  // Determine product category
  let category = "Học tập";
  if (productName.includes('AI') || productName.includes('GPT') || 
      productName.includes('Claude') || productName.includes('Copilot') || 
      productName.includes('Perplexity') || productName.includes('Grok')) {
    category = "AI";
  }
  
  // Check if this is a package/option for an existing product or a new product
  const packageName = row[2] ? row[2].trim() : '';
  const duration = row[3] ? row[3].trim() : '';
  const price = row[4] ? extractPrice(row[4]) : 0;
  const warranty = row[5] ? row[5].trim() : '';
  const promo = row[6] ? row[6].trim() : '';
  const notes = row[7] ? row[7].trim() : '';
  
  // Check if the product already exists
  if (existingSlugs.has(slug)) {
    console.log(`Product "${productName}" already exists with slug "${slug}"`);
    
    // Update existing product options if needed
    const existingProduct = productMap[slug];
    
    if (packageName && duration && price) {
      // Find the option for this package, or create a new one
      let packageOption = existingProduct.options.find(opt => 
        opt.localizedName.vi === packageName
      );
      
      if (!packageOption) {
        // Create a new option for this package
        packageOption = {
          id: Date.now().toString() + Math.floor(Math.random() * 1000),
          name: "",
          localizedName: {
            en: packageName,
            vi: packageName
          },
          type: "select",
          values: []
        };
        existingProduct.options.push(packageOption);
      }
      
      // Check if this duration already exists in the option
      const existingValue = packageOption.values.find(val => 
        val.localizedValue && val.localizedValue.vi === duration
      );
      
      if (!existingValue) {
        // Add the new duration/price
        packageOption.values.push({
          localizedValue: {
            en: duration,
            vi: duration
          },
          localizedPrice: {
            en: 0,
            vi: price
          },
          description: notes || ""
        });
        
        // Mark this product as updated
        if (!updatedProducts.includes(existingProduct)) {
          updatedProducts.push(existingProduct);
        }
        
        console.log(`Added new option ${packageName}/${duration} to ${productName}`);
      } else {
        // Update the existing value if price has changed
        if (existingValue.localizedPrice.vi !== price) {
          existingValue.localizedPrice.vi = price;
          existingValue.description = notes || existingValue.description;
          
          // Mark this product as updated
          if (!updatedProducts.includes(existingProduct)) {
            updatedProducts.push(existingProduct);
          }
          
          console.log(`Updated option ${packageName}/${duration} price for ${productName}`);
        }
      }
    }
    
    continue;
  }
  
  // This is a new product - only create it if we have a product name
  if (productName) {
    // Set up options array for the product
    const options = [];
    
    // Add the package/plan option if available
    if (packageName && duration) {
      const packageOption = {
        id: Date.now().toString() + Math.floor(Math.random() * 100),
        name: "",
        localizedName: {
          en: packageName,
          vi: packageName
        },
        type: "select",
        values: [{
          localizedValue: {
            en: duration,
            vi: duration
          },
          localizedPrice: {
            en: 0,
            vi: price
          },
          description: notes || ""
        }]
      };
      
      options.push(packageOption);
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
      description: notes || "",
      localizedDescription: {
        en: notes || "",
        vi: notes || ""
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
    existingSlugs.add(slug);
    productMap[slug] = newProduct;
    
    console.log(`Added new product: ${productName} (${slug})`);
  }
}

// Backup the current data
fs.writeFileSync(backupPath, JSON.stringify(storeData, null, 2), 'utf-8');
console.log(`Created backup at: ${backupPath}`);

// Update the store data with modified and new products
storeData.products = [...currentProducts, ...newProducts];

// Write the updated data back to the file
fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(storeData, null, 2), 'utf-8');
console.log(`Updated store data: ${newProducts.length} new products, ${updatedProducts.length} updated products`); 