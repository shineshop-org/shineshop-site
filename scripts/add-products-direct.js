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
const currentProducts = storeData.products || [];

// Create a map of existing products by slug for quick lookup
const productMap = {};
const existingSlugs = new Set();
currentProducts.forEach(product => {
  productMap[product.slug] = product;
  existingSlugs.add(product.slug);
});

// Helper to convert to slug format
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// New products to add
const productsToAdd = [
  {
    name: "Google One",
    category: "Lưu trữ",
    options: [
      {
        name: "1TB (slot gia đình)",
        values: []
      },
      {
        name: "5TB (chia sẻ được cho 5 người)",
        values: []
      }
    ]
  },
  {
    name: "Gemini - Veo 3",
    category: "AI",
    options: [
      {
        name: "Veo 3 (5 vid/ngày)",
        values: [
          { 
            duration: "1 tháng", 
            price: 150000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Copilot",
    category: "AI",
    options: [
      {
        name: "PRO",
        values: [
          { 
            duration: "1 tháng", 
            price: 380000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Claude",
    category: "AI",
    options: [
      {
        name: "PRO",
        values: [
          { 
            duration: "1 tháng", 
            price: 350000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Cursor AI",
    category: "AI",
    options: [
      {
        name: "PRO",
        values: [
          { 
            duration: "12 tháng", 
            price: 600000,
            description: "Bảo hành 3 tháng"
          }
        ]
      }
    ]
  },
  {
    name: "Windsurf AI",
    category: "AI",
    options: [
      {
        name: "PRO",
        values: [
          { 
            duration: "1 tháng", 
            price: 250000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Brainly",
    category: "Học tập",
    options: [
      {
        name: "PLUS",
        values: [
          { 
            duration: "1 tháng", 
            price: 200000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "6 tháng", 
            price: 500000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 700000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      },
      {
        name: "TUTOR",
        values: [
          { 
            duration: "1 tháng", 
            price: 500000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "6 tháng", 
            price: 1200000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 1700000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Camscanner",
    category: "Tiện ích",
    options: [
      {
        name: "PREMIUM",
        values: [
          { 
            duration: "12 tháng", 
            price: 365000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Busuu",
    category: "Học tập",
    options: [
      {
        name: "PREMIUM+",
        values: [
          { 
            duration: "1 tháng", 
            price: 50000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "6 tháng", 
            price: 200000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 300000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Chegg",
    category: "Học tập",
    options: [
      {
        name: "STUDY",
        values: [
          { 
            duration: "1 tháng", 
            price: 150000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Coursera",
    category: "Học tập",
    options: [
      {
        name: "PLUS",
        values: [
          { 
            duration: "1 tháng", 
            price: 700000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Quizlet Plus",
    category: "Học tập",
    options: [
      {
        name: "Tài khoản sẵn",
        values: [
          { 
            duration: "~30 ngày", 
            price: 0,
            description: "S H I N E S H O P _ Q U I Z L E T"
          },
          { 
            duration: "1 tháng", 
            price: 10000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 145000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      },
      {
        name: "Chính chủ",
        values: [
          { 
            duration: "12 tháng", 
            price: 195000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Duolingo",
    category: "Học tập",
    options: [
      {
        name: "SUPER",
        values: [
          { 
            duration: "12 tháng", 
            price: 180000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      },
      {
        name: "HACK",
        values: [
          { 
            duration: "100k KN", 
            price: 10000,
            description: "Bảo hành hoàn tiền 1 ngày. Có thể bị ban khỏi giải đấu và bảng xếp hạng"
          },
          { 
            duration: "10k GEM", 
            price: 10000,
            description: "Bảo hành hoàn tiền 1 ngày. Có thể bị ban khỏi giải đấu và bảng xếp hạng"
          },
          { 
            duration: "1k STREAK", 
            price: 10000,
            description: "Bảo hành hoàn tiền 1 ngày. Có thể bị ban khỏi giải đấu và bảng xếp hạng"
          }
        ]
      }
    ]
  },
  {
    name: "Lingokids",
    category: "Học tập",
    options: [
      {
        name: "PLUS",
        values: [
          { 
            duration: "1 tháng", 
            price: 100000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 800000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Brilliant",
    category: "Học tập",
    options: [
      {
        name: "PREMIUM",
        values: [
          { 
            duration: "12 tháng", 
            price: 1200000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Elsa",
    category: "Học tập",
    options: [
      {
        name: "PRO",
        values: [
          { 
            duration: "3 tháng", 
            price: 350000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 900000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      },
      {
        name: "PREMIUM",
        values: [
          { 
            duration: "3 tháng", 
            price: 500000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 1200000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Speak",
    category: "Học tập",
    options: [
      {
        name: "PREMIUM",
        values: [
          { 
            duration: "1 tháng", 
            price: 225000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 900000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      },
      {
        name: "PREMIUM PLUS",
        values: [
          { 
            duration: "1 tháng", 
            price: 475000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 2100000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "OtterAI",
    category: "AI",
    options: [
      {
        name: "PRO",
        values: [
          { 
            duration: "1 tháng", 
            price: 250000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Hanzii",
    category: "Học tập",
    options: [
      {
        name: "PREMIUM",
        values: [
          { 
            duration: "3 tháng", 
            price: 250000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 400000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "LIFE TIME", 
            price: 555555,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "ChineseSkill",
    category: "Học tập",
    options: [
      {
        name: "PREMIUM",
        values: [
          { 
            duration: "1 tháng", 
            price: 100000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "6 tháng", 
            price: 400000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 600000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "SuperChinese",
    category: "Học tập",
    options: [
      {
        name: "PLUS",
        values: []
      },
      {
        name: "CHAO",
        values: []
      }
    ]
  },
  {
    name: "HelloChinese",
    category: "Học tập",
    options: [
      {
        name: "PREMIUM",
        values: [
          { 
            duration: "1 tháng", 
            price: 140000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "3 tháng", 
            price: 310000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 850000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      },
      {
        name: "PREMIUM+",
        values: [
          { 
            duration: "1 tháng", 
            price: 250000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "6 tháng", 
            price: 1100000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          },
          { 
            duration: "12 tháng", 
            price: 1700000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Zoom Workplace Pro",
    category: "Tiện ích",
    options: [
      {
        name: "Tài khoản sẵn",
        values: [
          { 
            duration: "28 ngày", 
            price: 50000,
            description: "Bảo hành toàn bộ thời gian sử dụng. Tài khoản dùng thử hai lần 14 ngày"
          }
        ]
      },
      {
        name: "Chính chủ",
        values: [
          { 
            duration: "1 tháng", 
            price: 150000,
            description: "Bảo hành toàn bộ thời gian sử dụng. Loại xịn"
          },
          { 
            duration: "12 tháng", 
            price: 1500000,
            description: "Bảo hành toàn bộ thời gian sử dụng. Loại xịn"
          }
        ]
      }
    ]
  },
  {
    name: "Truecaller",
    category: "Tiện ích",
    options: [
      {
        name: "PREMIUM",
        values: [
          { 
            duration: "12 tháng", 
            price: 90000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Office 365",
    category: "Lưu trữ",
    options: [
      {
        name: "OFFICE & 1TB ONEDRIVE",
        values: [
          { 
            duration: "12 tháng", 
            price: 250000,
            description: "Bảo hành toàn bộ thời gian sử dụng"
          }
        ]
      }
    ]
  },
  {
    name: "Fonos",
    category: "Học tập",
    options: [
      {
        name: "PREMIUM",
        values: []
      }
    ]
  }
];

// Process and add new products
const newProducts = [];
const updatedProducts = [];

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

// Process each product in our list
productsToAdd.forEach(productData => {
  const productName = productData.name;
  const slug = toSlug(productName);
  
  // Check if the product already exists
  if (existingSlugs.has(slug)) {
    console.log(`Product "${productName}" already exists with slug "${slug}"`);
    
    // Update existing product if needed
    const existingProduct = productMap[slug];
    let productUpdated = false;
    
    // Add any missing options
    productData.options.forEach(optionData => {
      // Check if this option already exists
      const existingOption = existingProduct.options.find(opt => 
        opt.localizedName.vi === optionData.name
      );
      
      if (!existingOption) {
        // Create a new option
        const newOption = {
          id: Date.now().toString() + Math.floor(Math.random() * 1000),
          name: "",
          localizedName: {
            en: optionData.name,
            vi: optionData.name
          },
          type: "select",
          values: []
        };
        
        // Add values to the option
        optionData.values.forEach(valueData => {
          newOption.values.push({
            localizedValue: {
              en: valueData.duration,
              vi: valueData.duration
            },
            localizedPrice: {
              en: 0,
              vi: valueData.price
            },
            description: valueData.description || ""
          });
        });
        
        // Add the option to the product
        existingProduct.options.push(newOption);
        productUpdated = true;
        
        console.log(`Added new option "${optionData.name}" to ${productName}`);
      } else {
        // Check for missing values in existing option
        optionData.values.forEach(valueData => {
          const existingValue = existingOption.values.find(val => 
            val.localizedValue?.vi === valueData.duration
          );
          
          if (!existingValue) {
            // Add the missing value
            existingOption.values.push({
              localizedValue: {
                en: valueData.duration,
                vi: valueData.duration
              },
              localizedPrice: {
                en: 0,
                vi: valueData.price
              },
              description: valueData.description || ""
            });
            
            productUpdated = true;
            console.log(`Added new value "${valueData.duration}" to option "${optionData.name}" for ${productName}`);
          } else if (existingValue.localizedPrice?.vi !== valueData.price) {
            // Update price if different
            existingValue.localizedPrice.vi = valueData.price;
            existingValue.description = valueData.description || existingValue.description;
            
            productUpdated = true;
            console.log(`Updated price for "${valueData.duration}" in option "${optionData.name}" for ${productName}`);
          }
        });
      }
    });
    
    if (productUpdated && !updatedProducts.includes(existingProduct)) {
      updatedProducts.push(existingProduct);
    }
  } else {
    // Create a new product
    const category = productData.category || "Học tập";
    
    // Convert options to the correct format
    const options = productData.options.map(optionData => {
      const newOption = {
        id: Date.now().toString() + Math.floor(Math.random() * 1000),
        name: "",
        localizedName: {
          en: optionData.name,
          vi: optionData.name
        },
        type: "select",
        values: optionData.values.map(valueData => ({
          localizedValue: {
            en: valueData.duration,
            vi: valueData.duration
          },
          localizedPrice: {
            en: 0,
            vi: valueData.price
          },
          description: valueData.description || ""
        }))
      };
      
      return newOption;
    });
    
    // Create the product object
    const newProduct = {
      id: Date.now().toString() + Math.floor(Math.random() * 1000),
      name: slug,
      localizedName: {
        en: productName,
        vi: productName
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
});

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