import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const CSV_PATH = path.join(path.dirname(__dirname), 'BẢNG GIÁ SHINE SHOP - HỌC TẬP & HIỆU SUẤT.csv');
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
const currentProducts = storeData.products || [];

// Create a map of existing products by slug for quick lookup
const productMap = {};
const existingSlugs = new Set();
currentProducts.forEach(product => {
  productMap[product.slug] = product;
  existingSlugs.add(product.slug);
});

// Read and parse the CSV file
const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
const csvRecords = parse(csvContent, {
  skip_empty_lines: true,
});

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

// Helper to determine product category
function determineCategory(productName) {
  if (productName.includes('AI') || 
      productName.includes('GPT') || 
      productName.includes('Claude') || 
      productName.includes('Copilot') || 
      productName.includes('Perplexity') || 
      productName.includes('Grok') ||
      productName.includes('Cursor') ||
      productName.includes('Windsurf')) {
    return 'AI';
  }
  
  if (productName.includes('Google One') ||
      productName.includes('Office') ||
      productName.includes('OneDrive')) {
    return 'Lưu trữ';
  }
  
  if (productName.includes('Zoom') ||
      productName.includes('Truecaller')) {
    return 'Tiện ích';
  }
  
  // Default for educational products
  return 'Học tập';
}

// Function to get the English equivalent of categories
function getEnglishCategory(viCategory) {
  const categoryMap = {
    'AI': 'AI',
    'Học tập': 'Education',
    'Lưu trữ': 'Storage',
    'Tiện ích': 'Utilities',
    'Giải trí': 'Entertainment'
  };
  
  return categoryMap[viCategory] || 'Education';
}

// Skip the first two rows which are headers
console.log('Processing CSV with', csvRecords.length, 'rows');

// Process the CSV data to identify products
let currentProduct = null;
let currentOptionName = null;
let currentOptions = [];

// Start from row 3 (index 2) to skip the header rows
for (let i = 2; i < csvRecords.length; i++) {
  const row = csvRecords[i];
  
  // Skip if row is undefined or doesn't have enough columns
  if (!row || row.length < 2) {
    continue;
  }
  
  // Get product name from first column
  const productName = row[0]?.trim();
  
  // Skip empty rows or header/category rows
  if (!productName || productName === 'SẢN PHẨM' || productName.startsWith('Nhắn tin')) {
    continue;
  }
  
  // Check if this is a main product row (has a product name and nothing in column 2)
  const isMainProductRow = row[0]?.trim() !== '' && row[2]?.trim() === '';
  
  if (isMainProductRow) {
    // Save the previous product if exists
    if (currentProduct && currentOptions.length > 0) {
      const slug = toSlug(currentProduct);
      
      if (existingSlugs.has(slug)) {
        // Update existing product
        const existingProduct = productMap[slug];
        
        // Add missing options
        currentOptions.forEach(newOption => {
          // Check if this option already exists
          const existingOption = existingProduct.options.find(opt => 
            opt.localizedName.vi === newOption.localizedName.vi
          );
          
          if (!existingOption) {
            // Add the new option
            existingProduct.options.push(newOption);
            
            if (!updatedProducts.includes(existingProduct)) {
              updatedProducts.push(existingProduct);
            }
            
            console.log(`Added new option "${newOption.localizedName.vi}" to ${currentProduct}`);
          } else {
            // Update values in existing option
            newOption.values.forEach(newValue => {
              const existingValue = existingOption.values.find(val => 
                val.localizedValue?.vi === newValue.localizedValue?.vi
              );
              
              if (!existingValue) {
                // Add the new value
                existingOption.values.push(newValue);
                
                if (!updatedProducts.includes(existingProduct)) {
                  updatedProducts.push(existingProduct);
                }
                
                console.log(`Added new value "${newValue.localizedValue.vi}" to option "${newOption.localizedName.vi}" for ${currentProduct}`);
              } else if (existingValue.localizedPrice?.vi !== newValue.localizedPrice?.vi) {
                // Update price if changed
                existingValue.localizedPrice.vi = newValue.localizedPrice.vi;
                existingValue.description = newValue.description || existingValue.description;
                
                if (!updatedProducts.includes(existingProduct)) {
                  updatedProducts.push(existingProduct);
                }
                
                console.log(`Updated price for "${newValue.localizedValue.vi}" in option "${newOption.localizedName.vi}" for ${currentProduct}`);
              }
            });
          }
        });
      } else {
        // Create new product
        const category = determineCategory(currentProduct);
        
        const newProduct = {
          id: Date.now().toString() + Math.floor(Math.random() * 1000),
          name: slug,
          localizedName: {
            en: currentProduct,
            vi: currentProduct
          },
          price: 0,
          description: "",
          localizedDescription: {
            en: "",
            vi: ""
          },
          image: "", // Images will be added later manually
          localizedCategory: {
            en: getEnglishCategory(category),
            vi: category
          },
          slug: slug,
          options: currentOptions,
          relatedArticles: [],
          sortOrder: currentProducts.length + newProducts.length + 1,
          isLocalized: true,
          tags: []
        };
        
        newProducts.push(newProduct);
        existingSlugs.add(slug);
        productMap[slug] = newProduct;
        
        console.log(`Added new product: ${currentProduct} (${slug})`);
      }
    }
    
    // Start a new product
    currentProduct = productName;
    currentOptions = [];
    currentOptionName = null;
    
    console.log(`Processing product: ${currentProduct} at row ${i+1}`);
  } else if (currentProduct) {
    // This is an option row for the current product
    
    // Check if we have a new option type
    const optionName = row[2]?.trim();
    const duration = row[3]?.trim();
    const priceStr = row[4]?.trim();
    const warranty = row[5]?.trim();
    const promotion = row[6]?.trim();
    const notes = row[7]?.trim();
    
    if (optionName && optionName !== currentOptionName) {
      // Start a new option
      currentOptionName = optionName;
      
      console.log(`  Adding option: ${optionName}`);
      
      const newOption = {
        id: Date.now().toString() + Math.floor(Math.random() * 1000),
        name: "",
        localizedName: {
          en: optionName,
          vi: optionName
        },
        type: "select",
        values: []
      };
      
      currentOptions.push(newOption);
    }
    
    // Add the value to the current option if we have one
    if (currentOptions.length > 0 && duration && priceStr) {
      const price = extractPrice(priceStr);
      const currentOption = currentOptions[currentOptions.length - 1];
      
      console.log(`    Adding value: ${duration} - ${priceStr} (${price}₫)`);
      
      currentOption.values.push({
        localizedValue: {
          en: duration,
          vi: duration
        },
        localizedPrice: {
          en: 0,
          vi: price
        },
        description: notes || warranty || promotion || ""
      });
    }
  }
}

// Handle the last product
if (currentProduct && currentOptions.length > 0) {
  const slug = toSlug(currentProduct);
  
  if (existingSlugs.has(slug)) {
    // Update existing product
    const existingProduct = productMap[slug];
    
    // Add missing options
    currentOptions.forEach(newOption => {
      // Check if this option already exists
      const existingOption = existingProduct.options.find(opt => 
        opt.localizedName.vi === newOption.localizedName.vi
      );
      
      if (!existingOption) {
        // Add the new option
        existingProduct.options.push(newOption);
        
        if (!updatedProducts.includes(existingProduct)) {
          updatedProducts.push(existingProduct);
        }
        
        console.log(`Added new option "${newOption.localizedName.vi}" to ${currentProduct}`);
      } else {
        // Update values in existing option
        newOption.values.forEach(newValue => {
          const existingValue = existingOption.values.find(val => 
            val.localizedValue?.vi === newValue.localizedValue?.vi
          );
          
          if (!existingValue) {
            // Add the new value
            existingOption.values.push(newValue);
            
            if (!updatedProducts.includes(existingProduct)) {
              updatedProducts.push(existingProduct);
            }
            
            console.log(`Added new value "${newValue.localizedValue.vi}" to option "${newOption.localizedName.vi}" for ${currentProduct}`);
          } else if (existingValue.localizedPrice?.vi !== newValue.localizedPrice?.vi) {
            // Update price if changed
            existingValue.localizedPrice.vi = newValue.localizedPrice.vi;
            existingValue.description = newValue.description || existingValue.description;
            
            if (!updatedProducts.includes(existingProduct)) {
              updatedProducts.push(existingProduct);
            }
            
            console.log(`Updated price for "${newValue.localizedValue.vi}" in option "${newOption.localizedName.vi}" for ${currentProduct}`);
          }
        });
      }
    });
  } else {
    // Create new product
    const category = determineCategory(currentProduct);
    
    const newProduct = {
      id: Date.now().toString() + Math.floor(Math.random() * 1000),
      name: slug,
      localizedName: {
        en: currentProduct,
        vi: currentProduct
      },
      price: 0,
      description: "",
      localizedDescription: {
        en: "",
        vi: ""
      },
      image: "", // Images will be added later manually
      localizedCategory: {
        en: getEnglishCategory(category),
        vi: category
      },
      slug: slug,
      options: currentOptions,
      relatedArticles: [],
      sortOrder: currentProducts.length + newProducts.length + 1,
      isLocalized: true,
      tags: []
    };
    
    newProducts.push(newProduct);
    existingSlugs.add(slug);
    productMap[slug] = newProduct;
    
    console.log(`Added new product: ${currentProduct} (${slug})`);
  }
}

// Backup the current data
fs.writeFileSync(backupPath, JSON.stringify(storeData, null, 2), 'utf-8');
console.log(`Created backup at: ${backupPath}`);

// Update existing products
currentProducts.forEach((product, index) => {
  if (updatedProducts.includes(product)) {
    currentProducts[index] = productMap[product.slug];
  }
});

// Add new products
storeData.products = [...currentProducts, ...newProducts];

// Write the updated data back to the file
fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(storeData, null, 2), 'utf-8');
console.log(`Updated store data: ${newProducts.length} new products, ${updatedProducts.length} updated products`); 