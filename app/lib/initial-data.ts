import { Product, FAQArticle, SocialLink, SiteConfig, PaymentInfo } from './types'

// Định nghĩa giá trị mặc định cho dữ liệu
const defaultStoreData = {
  products: [],
  faqArticles: [],
  socialLinks: [],
  paymentInfo: {
    bankName: "MB Bank - Ngân hàng Thương mại Cổ phần Quân đội",
    accountNumber: "622566",
    accountName: "NGUYEN TUNG LAM",
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
export const dataVersion = storeData.dataVersion || defaultStoreData.dataVersion;