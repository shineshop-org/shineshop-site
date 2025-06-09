import { Product, FAQArticle, SocialLink, SiteConfig, PaymentInfo } from './types'

export const initialProducts: Product[] = [
  {
    "id": "1749230782074",
    "name": "youtube-premium",
    "localizedName": {
      "en": "Youtube Premium (Private Upgrade)",
      "vi": "Youtube/Music Premium"
    },
    "price": 0,
    "description": "Youtube Premium subscription service.",
    "localizedDescription": {
      "en": "Youtube Premium subscription service.",
      "vi": "Nâng cấp Youtube Premium chính chủ."
    },
    "image": "https://ik.imagekit.io/ngynlaam/PRODUCT/youtube-premium.png?updatedAt=1749032381807",
    "category": "Subscription",
    "localizedCategory": {
      "en": "Entertainment",
      "vi": "Giải trí"
    },
    "slug": "youtube-premium",
    "options": [
      {
        "id": "duration",
        "name": "Thời hạn",
        "type": "select",
        "values": [
          {
            "value": "1 tháng",
            "price": 30000,
            "localizedPrice": {
              "en": 3.5,
              "vi": 40000
            },
            "description": "",
            "localizedValue": {
              "en": "1 month",
              "vi": "1 tháng"
            }
          },
          {
            "value": "3 tháng",
            "price": 30000,
            "localizedPrice": {
              "en": 8.99,
              "vi": 100000
            },
            "description": "Hỗ trợ sửa lỗi \"Không thể tham gia gia đình\" do rời gia đình nhiều lần trong 12 tháng.",
            "localizedValue": {
              "en": "3 months",
              "vi": "3 tháng"
            }
          },
          {
            "value": "6 tháng",
            "price": 195000,
            "localizedPrice": {
              "en": 16.99,
              "vi": 195000
            },
            "description": "Hỗ trợ sửa lỗi \"Không thể tham gia gia đình\" do rời gia đình nhiều lần trong 12 tháng.",
            "localizedValue": {
              "en": "6 months",
              "vi": "6 tháng"
            }
          },
          {
            "value": "12 tháng",
            "localizedValue": {
              "en": "12 months",
              "vi": "12 tháng"
            },
            "price": 345000,
            "localizedPrice": {
              "en": 29.99,
              "vi": 345000
            },
            "description": "Hỗ trợ sửa lỗi \"Không thể tham gia gia đình\" do rời gia đình nhiều lần trong 12 tháng."
          }
        ],
        "localizedName": {
          "en": "Add to Family",
          "vi": "Thêm vào Gia Đình"
        }
      },
      {
        "id": "1749372245550",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Tài khoản sẵn"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "3 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 60000
            },
            "description": "Shop sẽ cung cấp tài khoản & mật khẩu cho bạn."
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "6 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 110000
            },
            "description": "Shop sẽ cung cấp tài khoản & mật khẩu cho bạn."
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "1 năm"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 195000
            },
            "description": "Shop sẽ cung cấp tài khoản & mật khẩu cho bạn."
          }
        ]
      },
      {
        "id": "1749372304383",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Cá nhân"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "Gói kích hoạt"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 80000
            },
            "description": "Shop sẽ đăng nhập vào tài khoản & mật khẩu của bạn, bạn sẽ sử dụng thẻ VISA để tự thanh toán gói Premium của bạn từ tháng sau - shop chỉ đóng vai trò kích hoạt giá rẻ."
          }
        ]
      }
    ],
    "relatedArticles": [],
    "sortOrder": 1,
    "isLocalized": true,
    "tags": []
  },
  {
    "id": "1749268374071",
    "name": "chat-gpt",
    "localizedName": {
      "en": "ChatGPT",
      "vi": "ChatGPT"
    },
    "price": 0,
    "description": "",
    "localizedDescription": {
      "en": "ChatGPT Plus Upgrade",
      "vi": "ChatGPT Plus Nâng cấp Chính chủ"
    },
    "image": "https://ik.imagekit.io/ngynlaam/PRODUCT/openAI.png?updatedAt=1749225595506",
    "category": "",
    "localizedCategory": {
      "en": "AI",
      "vi": "AI"
    },
    "slug": "chat-gpt",
    "options": [
      {
        "id": "1749268002232",
        "name": "",
        "localizedName": {
          "en": "Plus Subscription",
          "vi": "Plus"
        },
        "type": "select",
        "values": [
          {
            "value": "",
            "localizedValue": {
              "en": "Shared Account",
              "vi": "Tài khoản dùng chung"
            },
            "price": 0,
            "localizedPrice": {
              "en": 5.99,
              "vi": 150000
            },
            "description": "Bạn sẽ sắp xếp được dùng chung với 2 người - tổng 3 người"
          },
          {
            "value": "",
            "localizedValue": {
              "en": "Private Upgrade",
              "vi": "Nâng cấp chính chủ"
            },
            "price": 0,
            "localizedPrice": {
              "en": 15,
              "vi": 380000
            },
            "description": "Nâng cấp thẳng từ tài khoản của bạn"
          }
        ]
      }
    ],
    "relatedArticles": [],
    "sortOrder": 3,
    "isLocalized": true,
    "tags": []
  },
  {
    "id": "1749309085391",
    "name": "canva-pro",
    "localizedName": {
      "en": "Canva Pro",
      "vi": "Canva Pro"
    },
    "price": 0,
    "description": "",
    "localizedDescription": {
      "en": "",
      "vi": ""
    },
    "image": "https://ik.imagekit.io/ngynlaam/PRODUCT/canva.png?updatedAt=1749227851164",
    "localizedCategory": {
      "en": "Design",
      "vi": "Thiết kế"
    },
    "slug": "canva-pro",
    "options": [
      {
        "id": "1749308925118",
        "name": "",
        "localizedName": {
          "en": "Time",
          "vi": "Thời gian"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "1 months",
              "vi": "1 tháng"
            },
            "localizedPrice": {
              "en": 0.99,
              "vi": 10000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "1 year",
              "vi": "1 năm"
            },
            "localizedPrice": {
              "en": 4.99,
              "vi": 65000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "LIFE TIME",
              "vi": "Vĩnh viễn"
            },
            "localizedPrice": {
              "en": 20,
              "vi": 295000
            },
            "description": "Bảo hành 5 năm - tính từ ngày mua hàng"
          }
        ]
      }
    ],
    "relatedArticles": [],
    "sortOrder": 2,
    "isLocalized": true,
    "tags": []
  },
  {
    "id": "1749373306219",
    "name": "netflix-premium",
    "localizedName": {
      "en": "",
      "vi": "Netflix Premium 4K"
    },
    "price": 0,
    "description": "",
    "localizedDescription": {
      "en": "",
      "vi": "Tài khoản Netflix Premium cấp sẵn"
    },
    "image": "https://ik.imagekit.io/ngynlaam/PRODUCT/netflix-premium.jpg?updatedAt=1749226945890",
    "localizedCategory": {
      "en": "",
      "vi": "Giải trí"
    },
    "slug": "netflix-premium",
    "options": [
      {
        "id": "1749373321967",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Việt Nam"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "1 tuần"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 25000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "1 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 70000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "3 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 195000
            },
            "description": ""
          }
        ]
      },
      {
        "id": "1749373382731",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Nước ngoài"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "1 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 30000
            },
            "description": "Sử dụng VPN để đăng nhập cũng như sử dụng."
          }
        ]
      }
    ],
    "relatedArticles": [],
    "sortOrder": 4,
    "isLocalized": true,
    "tags": []
  },
  {
    "id": "1749375264380",
    "name": "",
    "localizedName": {
      "en": "",
      "vi": "Spotify Premium"
    },
    "price": 0,
    "description": "",
    "localizedDescription": {
      "en": "",
      "vi": "Nâng cấp Spotify Premium chính chủ."
    },
    "image": "https://ik.imagekit.io/ngynlaam/PRODUCT/spotify-premium.png?updatedAt=1749225841726",
    "localizedCategory": {
      "en": "",
      "vi": "Giải trí"
    },
    "slug": "spotify-premium",
    "options": [
      {
        "id": "1749375040963",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Thêm vào Gia Đình"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "1 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 30000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "3 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 85000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "6 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 165000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "1 năm"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 295000
            },
            "description": ""
          }
        ]
      },
      {
        "id": "1749375103979",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Tài khoản sẵn"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "6 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 85000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "1 năm"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 165000
            },
            "description": ""
          }
        ]
      },
      {
        "id": "1749375104452",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Cá nhân"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "6 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 195000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "12 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 345000
            },
            "description": ""
          }
        ]
      }
    ],
    "relatedArticles": [],
    "sortOrder": 5,
    "isLocalized": true,
    "tags": []
  },
  {
    "id": "1749450502889",
    "name": "",
    "localizedName": {
      "en": "",
      "vi": "Discord Nitro"
    },
    "price": 0,
    "description": "",
    "localizedDescription": {
      "en": "",
      "vi": ""
    },
    "image": "https://ik.imagekit.io/ngynlaam/PRODUCT/discord-nitro.png?updatedAt=1749226999701",
    "localizedCategory": {
      "en": "",
      "vi": "Giải trí"
    },
    "slug": "discord-nitro",
    "options": [
      {
        "id": "1749458022741",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Basic"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "1 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 30000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "1 năm"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 300000
            },
            "description": ""
          }
        ]
      },
      {
        "id": "1749458047194",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Nitro"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "1 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 80000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "12 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 800000
            },
            "description": ""
          }
        ]
      }
    ],
    "relatedArticles": [],
    "sortOrder": 6,
    "isLocalized": true,
    "tags": []
  },
  {
    "id": "1749463271625",
    "name": "",
    "localizedName": {
      "en": "",
      "vi": "Chess.com"
    },
    "price": 0,
    "description": "",
    "localizedDescription": {
      "en": "",
      "vi": ""
    },
    "image": "https://ik.imagekit.io/ngynlaam/PRODUCT/chess.png?updatedAt=1749227078784",
    "localizedCategory": {
      "en": "",
      "vi": "Giải trí"
    },
    "slug": "chess-com",
    "options": [
      {
        "id": "1749463182285",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Gold"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "1 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 30000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "1 năm"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 200000
            },
            "description": ""
          }
        ]
      },
      {
        "id": "1749463193689",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Platinum"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "1 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 40000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "1 năm"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 300000
            },
            "description": ""
          }
        ]
      },
      {
        "id": "1749463194005",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Diamond"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "1 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 60000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "1 năm"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 500000
            },
            "description": ""
          }
        ]
      }
    ],
    "relatedArticles": [],
    "sortOrder": 7,
    "isLocalized": true,
    "tags": []
  },
  {
    "id": "1749464085395",
    "name": "",
    "localizedName": {
      "en": "",
      "vi": "Soundcloud Artist"
    },
    "price": 0,
    "description": "",
    "localizedDescription": {
      "en": "",
      "vi": ""
    },
    "image": "https://ik.imagekit.io/ngynlaam/PRODUCT/soundcloud.png?updatedAt=1749458532383",
    "localizedCategory": {
      "en": "",
      "vi": "Giải trí"
    },
    "slug": "sound-cloud",
    "options": [
      {
        "id": "1749464055392",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Pro"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "1 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 100000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "1 năm"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 600000
            },
            "description": ""
          }
        ]
      }
    ],
    "relatedArticles": [],
    "sortOrder": 8,
    "isLocalized": true,
    "tags": []
  }
]

export const initialFAQArticles: FAQArticle[] = []

export const initialSocialLinks: SocialLink[] = [
  {
    "id": "1",
    "platform": "Facebook",
    "url": "https://facebook.com/shineshop",
    "icon": "facebook"
  },
  {
    "id": "2",
    "platform": "Instagram",
    "url": "https://instagram.com/shineshop",
    "icon": "instagram"
  },
  {
    "id": "3",
    "platform": "Twitter",
    "url": "https://twitter.com/shineshop",
    "icon": "twitter"
  },
  {
    "id": "4",
    "platform": "WhatsApp",
    "url": "https://wa.me/84123456789",
    "icon": "message-circle"
  },
  {
    "id": "5",
    "platform": "Telegram",
    "url": "https://t.me/shineshop",
    "icon": "send"
  },
  {
    "id": "6",
    "platform": "YouTube",
    "url": "https://youtube.com/@shineshop",
    "icon": "youtube"
  }
]

export const initialTOSContent = `# Terms of Service

**Effective Date: January 1, 2024**

## 1. Acceptance of Terms

By accessing and using Shine Shop ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use of Service

### 2.1 Eligibility
You must be at least 18 years old to use our services. By using our services, you represent and warrant that you meet this eligibility requirement.

### 2.2 Account Registration
- You must provide accurate and complete information
- You are responsible for maintaining the confidentiality of your account
- You are responsible for all activities under your account

## 3. Products and Services

### 3.1 Product Information
We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.

### 3.2 Pricing
All prices are listed in Vietnamese Dong (VND) and are subject to change without notice.

### 3.3 Availability
Products are subject to availability. We reserve the right to limit quantities and discontinue products without notice.

## 4. Orders and Payment

### 4.1 Order Acceptance
We reserve the right to refuse or cancel any order for any reason at any time.

### 4.2 Payment
Payment must be received before order processing. We accept various payment methods as listed on our payment page.

### 4.3 Order Cancellation
Orders may be cancelled before shipping. Once shipped, cancellation is subject to our return policy.

## 5. Shipping and Delivery

### 5.1 Shipping Policy
Shipping times and costs vary based on location and shipping method selected.

### 5.2 Risk of Loss
All items purchased from us are made pursuant to a shipment contract. Risk of loss and title pass to you upon delivery to the carrier.

## 6. Returns and Refunds

### 6.1 Return Policy
Items must be returned within 7 days of delivery in original condition with all packaging and accessories.

### 6.2 Refund Process
Refunds will be processed within 3-5 business days after receiving the returned item.

### 6.3 Non-Returnable Items
Certain items are non-returnable, including but not limited to:
- Opened software or digital products
- Personalized or custom-made items
- Clearance items

## 7. Intellectual Property

### 7.1 Ownership
All content on this website, including text, graphics, logos, images, and software, is the property of Shine Shop or its content suppliers.

### 7.2 Limited License
You are granted a limited license to access and make personal use of this site. This license does not include any resale or commercial use.

## 8. Privacy

Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.

## 9. Disclaimers and Limitations of Liability

### 9.1 Disclaimer of Warranties
THE SERVICES ARE PROVIDED "AS IS" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.

### 9.2 Limitation of Liability
IN NO EVENT SHALL SHINE SHOP BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

## 10. Indemnification

You agree to indemnify and hold harmless Shine Shop and its affiliates from any claim or demand made by any third party due to or arising out of your breach of these Terms of Service.

## 11. Governing Law

These Terms of Service shall be governed by and construed in accordance with the laws of Vietnam.

## 12. Changes to Terms

We reserve the right to update or change our Terms of Service at any time. Continued use of the service after any such changes shall constitute your consent to such changes.

## 13. Contact Information

If you have any questions about these Terms of Service, please contact us at:

**Shine Shop**  
Email: legal@shineshop.org  
Phone: 1800-SHINE  
Address: 123 Commerce Street, Ho Chi Minh City, Vietnam

---

By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.`

export const initialSiteConfig: SiteConfig = {
  "siteTitle": "SHINE SHOP",
  "heroTitle": "Welcome to SHINE SHOP!",
  "heroQuote": "Anh em mình cứ thế thôi hẹ hẹ hẹ",
  "contactLinks": {
    "facebook": "https://facebook.com/shineshop",
    "whatsapp": "https://wa.me/84123456789"
  }
}

export const initialPaymentInfo: PaymentInfo = {
  "bankName": "Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam",
  "accountNumber": "MS00T09331707449347",
  "accountName": "SHINE SHOP",
  "qrTemplate": "compact",
  "wiseEmail": "payment@shineshop.org",
  "paypalEmail": "paypal@shineshop.org"
}

export const initialLanguage = "vi"

export const initialTheme = "dark"

// Track data version for sync and migration
export const dataVersion = 2