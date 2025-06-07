const fs = require('fs');
const path = require('path');

// Function to find all directories recursively
function findDirectories(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      fileList.push(filePath);
      findDirectories(filePath, fileList);
    }
  });
  
  return fileList;
}

// Function to check if a file contains generateStaticParams
function checkForGenerateStaticParams(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes('generateStaticParams');
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('Checking for dynamic routes without generateStaticParams...');
  
  // Find all directories
  const appDir = path.join(__dirname, '..', 'app');
  const allDirs = findDirectories(appDir);
  
  // Filter for dynamic route directories (containing [ ])
  const dynamicRouteDirs = allDirs.filter(dir => {
    const dirName = path.basename(dir);
    return dirName.includes('[') && dirName.includes(']');
  });
  
  console.log(`Found ${dynamicRouteDirs.length} dynamic route directories:`);
  dynamicRouteDirs.forEach(dir => console.log(` - ${dir}`));
  
  // Check each dynamic route for page.tsx and generateStaticParams
  let missingParamsCount = 0;
  
  dynamicRouteDirs.forEach(dir => {
    const pagePath = path.join(dir, 'page.tsx');
    
    if (fs.existsSync(pagePath)) {
      const hasGenerateStaticParams = checkForGenerateStaticParams(pagePath);
      
      if (!hasGenerateStaticParams) {
        console.log(`⚠️ WARNING: ${pagePath} is missing generateStaticParams()`);
        missingParamsCount++;
      } else {
        console.log(`✅ ${pagePath} has generateStaticParams()`);
      }
    } else {
      console.log(`❓ ${dir} doesn't have a page.tsx file`);
    }
  });
  
  if (missingParamsCount > 0) {
    console.log(`\n⚠️ Found ${missingParamsCount} dynamic routes without generateStaticParams()`);
    console.log('These routes need to be fixed for static export to work properly.');
  } else {
    console.log('\n✅ All dynamic routes have generateStaticParams()');
  }
}

main(); 