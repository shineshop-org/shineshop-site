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
            "description": "Hỗ trợ sửa lỗi 'Không thể tham gia gia đình' do rời gia đình nhiều lần trong 12 tháng.",
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
            "description": "Hỗ trợ sửa lỗi 'Không thể tham gia gia đình' do rời gia đình nhiều lần trong 12 tháng.",
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
            "description": "Hỗ trợ sửa lỗi 'Không thể tham gia gia đình' do rời gia đình nhiều lần trong 12 tháng."
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
      },
      {
        "id": "1749464283583",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Team"
        },
        "type": "select",
        "values": [
          {
            "localizedValue": {
              "en": "",
              "vi": "Dùng chung"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 50000
            },
            "description": "Bạn sẽ sắp xếp được dùng chung với 2 người - tổng 3 người"
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "Chính chủ"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 150000
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
  },
  {
    "id": "1749464238905",
    "name": "",
    "localizedName": {
      "en": "",
      "vi": "Apple Music"
    },
    "price": 0,
    "description": "",
    "localizedDescription": {
      "en": "",
      "vi": ""
    },
    "image": "https://ik.imagekit.io/ngynlaam/PRODUCT/apple-music.jpg?updatedAt=1749464167735",
    "localizedCategory": {
      "en": "",
      "vi": "Giải trí"
    },
    "slug": "apple-music",
    "options": [
      {
        "id": "1749464191906",
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
              "vi": "1 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 30000
            },
            "description": ""
          }
        ]
      }
    ],
    "relatedArticles": [],
    "sortOrder": 9,
    "isLocalized": true,
    "tags": []
  },
  {
    "id": "1749467549911",
    "name": "perplexity",
    "localizedName": {
      "en": "",
      "vi": "Perplexity"
    },
    "price": 0,
    "description": "",
    "localizedDescription": {
      "en": "",
      "vi": ""
    },
    "image": "https://ik.imagekit.io/ngynlaam/PRODUCT/perplexity.jpg?updatedAt=1749227148688",
    "localizedCategory": {
      "en": "",
      "vi": "AI"
    },
    "slug": "perplexity",
    "options": [
      {
        "id": "1749467440429",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Thêm vào Đội Nhóm"
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
              "vi": "6 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 155000
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
              "vi": 250000
            },
            "description": ""
          }
        ]
      },
      {
        "id": "1749467515749",
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
              "vi": "1 năm"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 400000
            },
            "description": ""
          }
        ]
      }
    ],
    "relatedArticles": [],
    "sortOrder": 10,
    "isLocalized": true,
    "tags": []
  },
  {
    "id": "1749468256042",
    "name": "super-grok",
    "localizedName": {
      "en": "",
      "vi": "Super Grok"
    },
    "price": 0,
    "description": "",
    "localizedDescription": {
      "en": "",
      "vi": ""
    },
    "image": "https://ik.imagekit.io/ngynlaam/PRODUCT/super-grok.png?updatedAt=1749226361221",
    "localizedCategory": {
      "en": "",
      "vi": "AI"
    },
    "slug": "super-grok",
    "options": [
      {
        "id": "1749468147466",
        "name": "",
        "localizedName": {
          "en": "",
          "vi": "Dùng chung"
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
              "vi": "2 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 180000
            },
            "description": ""
          }
        ]
      },
      {
        "id": "1749468172223",
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
              "vi": "1 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 200000
            },
            "description": ""
          },
          {
            "localizedValue": {
              "en": "",
              "vi": "2 tháng"
            },
            "localizedPrice": {
              "en": 0,
              "vi": 300000
            },
            "description": "'KBH' tức 'Không bảo hành' - Shop sẽ miễn hoàn toàn trách nghiệm khi bạn nhận được tài khoản có gói Super của Grok."
          }
        ]
      }
    ],
    "relatedArticles": [],
    "sortOrder": 11,
    "isLocalized": true,
    "tags": []
  }
]

export const initialFAQArticles: FAQArticle[] = []

export const initialSocialLinks: SocialLink[] = [{"id":"1","platform":"Facebook","url":"https://facebook.com/shineshop","icon":"facebook"},{"id":"2","platform":"Instagram","url":"https://instagram.com/shineshop","icon":"instagram"},{"id":"3","platform":"Twitter","url":"https://twitter.com/shineshop","icon":"twitter"},{"id":"4","platform":"WhatsApp","url":"https://wa.me/84123456789","icon":"message-circle"},{"id":"5","platform":"Telegram","url":"https://t.me/shineshop","icon":"send"},{"id":"6","platform":"YouTube","url":"https://youtube.com/@shineshop","icon":"youtube"}];



export const initialTOSContent = "# Terms of Service\n\n**Effective Date: January 1, 2024**\n\n## 1. Acceptance of Terms\n\nBy accessing and using Shine Shop (\"we,\" \"our,\" or \"us\"), you accept and agree to be bound by the terms and provision of this agreement.\n\n## 2. Use of Service\n\n### 2.1 Eligibility\nYou must be at least 18 years old to use our services. By using our services, you represent and warrant that you meet this eligibility requirement.\n\n### 2.2 Account Registration\n- You must provide accurate and complete information\n- You are responsible for maintaining the confidentiality of your account\n- You are responsible for all activities under your account\n\n## 3. Products and Services\n\n### 3.1 Product Information\nWe strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.\n\n### 3.2 Pricing\nAll prices are listed in Vietnamese Dong (VND) and are subject to change without notice.\n\n### 3.3 Availability\nProducts are subject to availability. We reserve the right to limit quantities and discontinue products without notice.\n\n## 4. Orders and Payment\n\n### 4.1 Order Acceptance\nWe reserve the right to refuse or cancel any order for any reason at any time.\n\n### 4.2 Payment\nPayment must be received before order processing. We accept various payment methods as listed on our payment page.\n\n### 4.3 Order Cancellation\nOrders may be cancelled before shipping. Once shipped, cancellation is subject to our return policy.\n\n## 5. Shipping and Delivery\n\n### 5.1 Shipping Policy\nShipping times and costs vary based on location and shipping method selected.\n\n### 5.2 Risk of Loss\nAll items purchased from us are made pursuant to a shipment contract. Risk of loss and title pass to you upon delivery to the carrier.\n\n## 6. Returns and Refunds\n\n### 6.1 Return Policy\nItems must be returned within 7 days of delivery in original condition with all packaging and accessories.\n\n### 6.2 Refund Process\nRefunds will be processed within 3-5 business days after receiving the returned item.\n\n### 6.3 Non-Returnable Items\nCertain items are non-returnable, including but not limited to:\n- Opened software or digital products\n- Personalized or custom-made items\n- Clearance items\n\n## 7. Intellectual Property\n\n### 7.1 Ownership\nAll content on this website, including text, graphics, logos, images, and software, is the property of Shine Shop or its content suppliers.\n\n### 7.2 Limited License\nYou are granted a limited license to access and make personal use of this site. This license does not include any resale or commercial use.\n\n## 8. Privacy\n\nYour use of our services is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.\n\n## 9. Disclaimers and Limitations of Liability\n\n### 9.1 Disclaimer of Warranties\nTHE SERVICES ARE PROVIDED \"AS IS\" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.\n\n### 9.2 Limitation of Liability\nIN NO EVENT SHALL SHINE SHOP BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.\n\n## 10. Indemnification\n\nYou agree to indemnify and hold harmless Shine Shop and its affiliates from any claim or demand made by any third party due to or arising out of your breach of these Terms of Service.\n\n## 11. Governing Law\n\nThese Terms of Service shall be governed by and construed in accordance with the laws of Vietnam.\n\n## 12. Changes to Terms\n\nWe reserve the right to update or change our Terms of Service at any time. Continued use of the service after any such changes shall constitute your consent to such changes.\n\n## 13. Contact Information\n\nIf you have any questions about these Terms of Service, please contact us at:\n\n**Shine Shop**  \nEmail: legal@shineshop.org  \nPhone: 1800-SHINE  \nAddress: 123 Commerce Street, Ho Chi Minh City, Vietnam\n\n---\n\nBy using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.";



export const initialSiteConfig: SiteConfig = {"siteTitle":"SHINE SHOP","heroTitle":"Welcome to SHINE SHOP!","heroQuote":"Anh em mình cứ thế thôi hẹ hẹ hẹ","contactLinks":{"facebook":"https://facebook.com/shineshop","whatsapp":"https://wa.me/84123456789"}};



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