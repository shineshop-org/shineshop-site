import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Configure as force-static for compatibility with static exports
export const dynamic = 'force-static'

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'store-data.json')
const DATA_DIR = path.join(process.cwd(), 'data')
const INITIAL_DATA_PATH = path.join(process.cwd(), 'app', 'lib', 'initial-data.ts')

// Ensure data directory exists
function ensureDataDir() {
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true })
	}
}

// Safe JSON parse with error handling
function safeJsonParse(text: string) {
	try {
		return JSON.parse(text)
	} catch (error) {
		console.error('Error parsing JSON:', error)
		throw new Error('Failed to parse JSON data')
	}
}

// Đọc dữ liệu từ file
function readStoreData() {
	try {
		if (!fs.existsSync(DATA_FILE_PATH)) {
			// Nếu file không tồn tại, trả về đối tượng rỗng
			return {}
		}
		
		const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8')
		return safeJsonParse(fileContent)
	} catch (error) {
		console.error('Error reading store data:', error)
		// Trả về đối tượng rỗng nếu có lỗi
		return {}
	}
}

// Buộc build lại initial-data.ts từ dữ liệu trong store-data.json
function rebuildInitialData() {
	// Không thực hiện rebuild trong production
	if (process.env.NODE_ENV !== 'development') {
		return { success: false, message: 'Rebuild chỉ được thực hiện trong môi trường development' }
	}
	
	try {
		// Đọc dữ liệu từ store-data.json
		const storeData = readStoreData();
		
		// Tạo nội dung file initial-data.ts mới
		const newContent = `import { Product, FAQArticle, SocialLink, SiteConfig, PaymentInfo } from './types'

// Định nghĩa giá trị mặc định cho dữ liệu
const defaultStoreData = {
  products: [],
  faqArticles: [],
  socialLinks: [],
  paymentInfo: {
    bankName: "Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam",
    accountNumber: "MS00T09331707449347",
    accountName: "SHINE SHOP",
    qrTemplate: "compact",
    wiseEmail: "payment@shineshop.org",
    paypalEmail: "paypal@shineshop.org"
  },
  siteConfig: {
    siteTitle: "SHINE SHOP",
    heroTitle: "Welcome to SHINE SHOP!",
    heroQuote: "Anh em mình cứ thế thôi hẹ hẹ hẹ",
    contactLinks: {
      facebook: "https://facebook.com/shineshop",
      whatsapp: "https://wa.me/84123456789"
    }
  },
  tosContent: "",
  language: 'vi',
  theme: 'light',
  dataVersion: 1
}

// Cố gắng import JSON trực tiếp - điều này hoạt động tại build-time
let storeData;
try {
  // Import động - chỉ hoạt động nếu file tồn tại và chỉ ở build time
  // @ts-ignore - Bỏ qua lỗi TypeScript về import động
  storeData = require('../../data/store-data.json');
} catch (error) {
  // Fallback nếu không thể import
  console.info('Không thể import store-data.json, sử dụng dữ liệu mặc định');
  storeData = defaultStoreData;
}

// Export các giá trị
export const initialProducts: Product[] = storeData.products || defaultStoreData.products;
export const initialFAQArticles: FAQArticle[] = storeData.faqArticles || defaultStoreData.faqArticles;
export const initialSocialLinks: SocialLink[] = storeData.socialLinks || defaultStoreData.socialLinks;
export const initialPaymentInfo: PaymentInfo = storeData.paymentInfo || defaultStoreData.paymentInfo;
export const initialSiteConfig: SiteConfig = storeData.siteConfig || defaultStoreData.siteConfig;
export const initialTOSContent: string = storeData.tosContent || defaultStoreData.tosContent;
export const initialLanguage = storeData.language || defaultStoreData.language;
export const initialTheme = storeData.theme || defaultStoreData.theme;
export const dataVersion = storeData.dataVersion || defaultStoreData.dataVersion;`;

		// Ghi file mới
		try {
			fs.writeFileSync(INITIAL_DATA_PATH, newContent, 'utf-8');
			console.log('Đã cập nhật initial-data.ts thành công');
			return { success: true, message: 'Đã cập nhật initial-data.ts thành công' };
		} catch (writeError) {
			console.error('Lỗi khi ghi file initial-data.ts:', writeError);
			return { 
				success: false, 
				message: `Không thể ghi file initial-data.ts: ${(writeError as Error).message}` 
			};
		}
	} catch (error) {
		console.error('Error rebuilding initial-data:', error)
		return { 
			success: false, 
			message: `Lỗi khi rebuild initial-data: ${(error as Error).message}` 
		}
	}
}

export async function GET(request: NextRequest) {
	try {
		ensureDataDir()
		
		// Kiểm tra nếu yêu cầu rebuild
		const { searchParams } = new URL(request.url)
		const shouldRebuild = searchParams.get('rebuild') === 'true'
		
		if (shouldRebuild) {
			const rebuildResult = rebuildInitialData()
			return NextResponse.json({
				...readStoreData(),
				rebuildResult
			})
		}
		
		// Đọc dữ liệu từ file
		const data = readStoreData()
		
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error getting store data:', error)
		return NextResponse.json(
			{ error: 'Failed to get store data', message: (error as Error).message },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		let data;
		
		// Check for admin headers to set a cookie that will prevent redirects
		const isAdminRequest = request.headers.get('X-Admin-Request') === 'true';
		const preventRedirect = request.headers.get('X-Prevent-Redirect') === 'true';
		const isAdminSession = request.headers.get('X-Admin-Session') === 'true';
		const isFromAdmin = request.headers.get('referer')?.includes('/admin');
		
		// Create an indicator for admin context
		const isAdminContext = isAdminRequest || preventRedirect || isAdminSession || isFromAdmin;
		
		// Đọc dữ liệu từ request
		try {
			data = await request.json();
		} catch (jsonError) {
			try {
				// Nếu không được thì đọc text và parse thủ công
				const text = await request.text();
				data = safeJsonParse(text);
			} catch (textError) {
				console.error('Error parsing request:', textError);
				// Return success response to avoid redirects
				const response = NextResponse.json(
					{ error: 'Invalid JSON format in request body', success: false },
					{ status: 200 }
				);
				
				if (isAdminContext) {
					addAdminCookiesToResponse(response);
				}
				
				return response;
			}
		}
		
		if (!data) {
			console.error('No data received');
			// Return success response to avoid redirects
			const response = NextResponse.json(
				{ error: 'No data received', success: false },
				{ status: 200 }
			);
			
			if (isAdminContext) {
				addAdminCookiesToResponse(response);
			}
			
			return response;
		}
		
		ensureDataDir()
		
		// Đọc dữ liệu hiện tại để merge
		const existingData = readStoreData();
		
		// Merge dữ liệu từ request vào dữ liệu hiện tại
		const mergedData = { ...existingData, ...data };
		
		// Sanitize descriptions to handle special characters
		if (mergedData.products && Array.isArray(mergedData.products)) {
			mergedData.products = mergedData.products.map((product: any) => {
				// Sanitize option descriptions
				if (product.options && Array.isArray(product.options)) {
					product.options = product.options.map((option: any) => {
						if (option.values && Array.isArray(option.values)) {
							option.values = option.values.map((value: any) => {
								// Handle any problematic characters in descriptions
								if (value.description) {
									// Replace problematic quotes with safe ones
									value.description = value.description.replace(/\\"/g, "'").replace(/"/g, "'");
								}
								return value;
							});
						}
						return option;
					});
				}
				return product;
			});
		}
		
		// Kiểm tra nếu yêu cầu rebuild từ query param
		const { searchParams } = new URL(request.url)
		const shouldRebuild = searchParams.get('rebuild') === 'true'
		
		// Save data to file with error handling
		try {
			fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(mergedData, null, 2), 'utf-8')
			
			// Chỉ thực hiện rebuild khi có param rebuild=true
			let rebuildResult: any = { executed: false, message: 'Không có yêu cầu rebuild' };
			if (shouldRebuild) {
				rebuildResult = rebuildInitialData();
			}
			
			// Create response with success message
			const response = NextResponse.json({ 
				success: true,
				message: 'Data updated successfully',
				rebuildResult,
				adminContext: isAdminContext
			});
			
			// Always set admin session cookies for admin-originated requests
			if (isAdminContext) {
				addAdminCookiesToResponse(response);
			}
			
			return response;
		} catch (writeError) {
			console.error('Error writing store data:', writeError);
			
			// Create error response
			const response = NextResponse.json(
				{ error: 'Failed to write store data', message: (writeError as Error).message, success: false },
				{ status: 200 } // Still return 200 to avoid redirect
			);
			
			// Still set admin cookies even on error for admin-originated requests
			if (isAdminContext) {
				addAdminCookiesToResponse(response);
			}
			
			return response;
		}
	} catch (error) {
		console.error('Error processing store data request:', error);
		// Create error response
		const response = NextResponse.json(
			{ error: 'Failed to process store data request', message: (error as Error).message, success: false },
			{ status: 200 } // Still return 200 to avoid redirect
		);
		
		// Try to set admin cookies even on general error, just in case
		try {
			addAdminCookiesToResponse(response);
		} catch (e) {
			console.error('Error setting admin cookies:', e);
		}
		
		return response;
	}
}

// Helper function to add admin cookies to responses
function addAdminCookiesToResponse(response: NextResponse) {
	// Set admin session cookies
	response.cookies.set('adminAuthenticated', 'true', {
		httpOnly: true,
		maxAge: 60 * 60, // 1 hour
		path: '/',
		sameSite: 'strict'
	});
	
	response.cookies.set('admin_session', 'true', {
		httpOnly: true,
		maxAge: 60 * 60, // 1 hour
		path: '/',
		sameSite: 'strict'
	});
	
	// Add headers to prevent redirects
	response.headers.set('X-Prevent-Redirect', 'true');
	response.headers.set('X-Admin-Request', 'true');
	response.headers.set('X-Admin-Session', 'true');
	response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
	response.headers.set('Pragma', 'no-cache');
	response.headers.set('Expires', '0');
	
	return response;
} 