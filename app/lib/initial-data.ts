import { Product, FAQArticle, SocialLink } from './types'

export const initialProducts: Product[] = [
	{
		id: '1',
		name: 'Premium Wireless Headphones',
		price: 1299000,
		description: 'High-quality wireless headphones with active noise cancellation and superior sound quality. Perfect for music lovers and professionals.',
		image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
		category: 'Electronics',
		slug: 'premium-wireless-headphones',
		sortOrder: 1,
		options: [
			{
				id: 'color',
				name: 'Color',
				type: 'select',
				values: [
					{
						value: 'Black',
						price: 1299000,
						description: 'Classic black color with matte finish'
					},
					{
						value: 'White',
						price: 1299000,
						description: 'Clean white design with silver accents'
					},
					{
						value: 'Blue',
						price: 1399000,
						description: 'Limited edition navy blue color'
					}
				]
			}
		],
		relatedArticles: ['1', '2']
	},
	{
		id: 'youtube-premium',
		name: 'Youtube Premium (chính chủ)',
		price: 0,
		description: 'Youtube Premium subscription service.',
		image: 'https://ik.imagekit.io/ngynlaam/PRODUCT/youtube-premium.png',
		category: 'Subscription',
		slug: 'youtube-premium',
		sortOrder: 0,
		options: [
			{
				id: 'duration',
				name: 'Thời hạn',
				type: 'select',
				values: [
					{
						value: '1 tháng',
						price: 40000,
						description: '40000đ cho tháng đầu tiên và sau đó là 35000đ nếu bạn gia hạn đúng thời điểm hoặc trước đó'
					},
					{
						value: '3 tháng',
						price: 100000,
						description: 'Hỗ trợ sửa lỗi "Không thể tham gia gia đình" do rời gia đình nhiều lần trong 12 tháng.'
					},
					{
						value: '6 tháng',
						price: 195000,
						description: ''
					}
				]
			}
		]
	},
	{
		id: '2',
		name: 'Smart Watch Pro',
		price: 3499000,
		description: 'Advanced smartwatch with health monitoring, GPS, and fitness tracking features.',
		image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
		category: 'Electronics',
		slug: 'smart-watch-pro',
		sortOrder: 2,
		options: [
			{
				id: 'size',
				name: 'Band Size',
				type: 'radio',
				values: [
					{
						value: 'Small',
						price: 3499000,
						description: 'Fits wrists 140-160mm'
					},
					{
						value: 'Medium',
						price: 3499000,
						description: 'Fits wrists 160-180mm'
					},
					{
						value: 'Large',
						price: 3599000,
						description: 'Fits wrists 180-220mm'
					}
				]
			}
		]
	},
	{
		id: '3',
		name: 'Portable Power Bank 20000mAh',
		price: 599000,
		description: 'High-capacity power bank with fast charging support for all your devices.',
		image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
		category: 'Accessories',
		slug: 'portable-power-bank-20000mah',
		sortOrder: 3
	},
	{
		id: '4',
		name: 'Mechanical Gaming Keyboard',
		price: 1799000,
		description: 'RGB mechanical keyboard with customizable switches for gaming enthusiasts.',
		image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
		category: 'Gaming',
		slug: 'mechanical-gaming-keyboard',
		sortOrder: 4,
		options: [
			{
				id: 'switch',
				name: 'Switch Type',
				type: 'select',
				values: [
					{
						value: 'Red',
						price: 1799000,
						description: 'Linear switches with quick actuation, ideal for gaming'
					},
					{
						value: 'Blue',
						price: 1899000,
						description: 'Tactile and clicky switches with audible feedback'
					},
					{
						value: 'Brown',
						price: 1849000,
						description: 'Tactile switches with a softer feel, good for typing and gaming'
					}
				]
			}
		]
	},
	{
		id: '5',
		name: 'Wireless Gaming Mouse',
		price: 999000,
		description: 'Professional gaming mouse with high DPI sensor and customizable buttons.',
		image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
		category: 'Gaming',
		slug: 'wireless-gaming-mouse',
		sortOrder: 5
	},
	{
		id: '6',
		name: 'USB-C Hub 7-in-1',
		price: 799000,
		description: 'Multi-port USB-C hub with HDMI, USB 3.0, SD card reader, and PD charging.',
		image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
		category: 'Accessories',
		slug: 'usb-c-hub-7-in-1',
		sortOrder: 6
	},
	{
		id: '7',
		name: '4K Webcam',
		price: 1999000,
		description: 'Professional 4K webcam with auto-focus and noise-canceling microphone.',
		image: 'https://images.unsplash.com/photo-1598986646512-9330bcc4c0dc?w=500',
		category: 'Electronics',
		slug: '4k-webcam',
		sortOrder: 7
	},
	{
		id: '8',
		name: 'Wireless Charging Pad',
		price: 399000,
		description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
		image: 'https://images.unsplash.com/photo-1622675363311-3e1904dc1885?w=500',
		category: 'Accessories',
		slug: 'wireless-charging-pad',
		sortOrder: 8
	},
	{
		id: '9',
		name: 'Gaming Headset RGB',
		price: 1499000,
		description: '7.1 surround sound gaming headset with RGB lighting and detachable mic.',
		image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500',
		category: 'Gaming',
		slug: 'gaming-headset-rgb',
		sortOrder: 9
	},
	{
		id: '10',
		name: 'Smartphone Gimbal Stabilizer',
		price: 2299000,
		description: '3-axis gimbal stabilizer for smooth video recording with smartphones.',
		image: 'https://images.unsplash.com/photo-1622782914767-404fb9ab3f57?w=500',
		category: 'Photography',
		slug: 'smartphone-gimbal-stabilizer',
		sortOrder: 10
	},
	{
		id: '11',
		name: 'LED Ring Light',
		price: 899000,
		description: '18-inch LED ring light with adjustable brightness and color temperature.',
		image: 'https://images.unsplash.com/photo-1606986628253-05620e9b0a80?w=500',
		category: 'Photography',
		slug: 'led-ring-light',
		sortOrder: 11
	},
	{
		id: '12',
		name: 'Bluetooth Speaker Waterproof',
		price: 699000,
		description: 'Portable waterproof Bluetooth speaker with 360° sound and 24-hour battery.',
		image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
		category: 'Audio',
		slug: 'bluetooth-speaker-waterproof',
		sortOrder: 12
	},
	{
		id: '13',
		name: 'Laptop Stand Adjustable',
		price: 499000,
		description: 'Ergonomic aluminum laptop stand with adjustable height and angle.',
		image: 'https://images.unsplash.com/photo-1527335480088-278dbeec0ad5?w=500',
		category: 'Accessories',
		slug: 'laptop-stand-adjustable',
		sortOrder: 13
	},
	{
		id: '14',
		name: 'Smart Home Security Camera',
		price: 1599000,
		description: '1080p HD security camera with night vision and two-way audio.',
		image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500',
		category: 'Smart Home',
		slug: 'smart-home-security-camera',
		sortOrder: 14
	},
	{
		id: '15',
		name: 'Wireless Earbuds Pro',
		price: 2999000,
		description: 'Premium wireless earbuds with ANC and transparency mode.',
		image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
		category: 'Audio',
		slug: 'wireless-earbuds-pro',
		sortOrder: 15
	},
	{
		id: '16',
		name: 'External SSD 1TB',
		price: 2199000,
		description: 'Portable external SSD with USB 3.2 Gen 2 for fast data transfer.',
		image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
		category: 'Storage',
		slug: 'external-ssd-1tb',
		sortOrder: 16
	},
	{
		id: '17',
		name: 'Smart LED Light Bulbs (4 Pack)',
		price: 999000,
		description: 'WiFi-enabled smart LED bulbs with millions of colors and voice control.',
		image: 'https://images.unsplash.com/photo-1565636192929-181a3dd69e60?w=500',
		category: 'Smart Home',
		slug: 'smart-led-light-bulbs',
		sortOrder: 17
	},
	{
		id: '18',
		name: 'Car Phone Mount',
		price: 299000,
		description: 'Universal car phone mount with 360° rotation and strong magnetic hold.',
		image: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=500',
		category: 'Accessories',
		slug: 'car-phone-mount',
		sortOrder: 18
	},
	{
		id: '19',
		name: 'Fitness Tracker Band',
		price: 799000,
		description: 'Water-resistant fitness tracker with heart rate monitor and sleep tracking.',
		image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500',
		category: 'Fitness',
		slug: 'fitness-tracker-band',
		sortOrder: 19
	},
	{
		id: '20',
		name: 'Tablet Keyboard Case',
		price: 899000,
		description: 'Protective case with detachable Bluetooth keyboard for tablets.',
		image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500',
		category: 'Accessories',
		slug: 'tablet-keyboard-case',
		sortOrder: 20
	}
]

export const initialFAQArticles: FAQArticle[] = [
	{
		id: '1',
		title: 'How to make a purchase?',
		content: `# How to make a purchase?

Making a purchase on our website is simple and secure. Follow these steps:

1. **Browse our products** - Navigate through our product categories or use the search function
2. **Select your product** - Click on any product to view details
3. **Choose options** - Select size, color, or other available options
4. **Contact us** - Click the "Order Now" button to contact us via Facebook or WhatsApp
5. **Complete payment** - Follow the payment instructions provided by our team

Our customer service team is available 24/7 to assist you with your purchase.`,
		category: 'Shopping',
		slug: 'how-to-make-a-purchase',
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
		tags: ['purchase', 'shopping', 'guide']
	},
	{
		id: '2',
		title: 'What payment methods do you accept?',
		content: `# Payment Methods

We accept various payment methods for your convenience:

- **Bank Transfer** - Direct transfer to our bank account
- **VietQR** - Quick payment using QR code
- **Cash on Delivery** - Available for selected areas
- **E-wallets** - MoMo, ZaloPay, VNPay

All transactions are secure and encrypted. You'll receive a confirmation once payment is processed.`,
		category: 'Payment',
		slug: 'payment-methods',
		createdAt: new Date('2024-01-02'),
		updatedAt: new Date('2024-01-02'),
		tags: ['payment', 'methods', 'banking']
	},
	{
		id: '3',
		title: 'Shipping and Delivery Information',
		content: `# Shipping and Delivery

We offer nationwide shipping with the following options:

## Delivery Times
- **Express Delivery**: 1-2 business days
- **Standard Delivery**: 3-5 business days
- **Economy Delivery**: 5-7 business days

## Shipping Fees
- Orders over 500,000 VND: FREE shipping
- Orders under 500,000 VND: 30,000 VND flat rate

## Tracking
You'll receive a tracking number via SMS/Email once your order ships.`,
		category: 'Shipping',
		slug: 'shipping-delivery-info',
		createdAt: new Date('2024-01-03'),
		updatedAt: new Date('2024-01-03'),
		tags: ['shipping', 'delivery', 'tracking']
	},
	{
		id: '4',
		title: 'Return and Refund Policy',
		content: `# Return and Refund Policy

We want you to be completely satisfied with your purchase.

## Return Eligibility
- Items must be returned within **7 days** of delivery
- Products must be unused and in original packaging
- Include all tags, accessories, and documentation

## How to Return
1. Contact our customer service team
2. Receive a return authorization number
3. Ship the item back to us
4. Refund processed within 3-5 business days

## Non-returnable Items
- Opened software or digital products
- Personalized or custom-made items
- Clearance or final sale items`,
		category: 'Returns',
		slug: 'return-refund-policy',
		createdAt: new Date('2024-01-04'),
		updatedAt: new Date('2024-01-04'),
		tags: ['returns', 'refund', 'policy']
	},
	{
		id: '5',
		title: 'Product Warranty Information',
		content: `# Product Warranty

All products come with manufacturer warranty.

## Warranty Coverage
- **Electronics**: 12-24 months warranty
- **Accessories**: 6-12 months warranty
- **Gaming Products**: 12 months warranty

## What's Covered
- Manufacturing defects
- Component failures
- Software issues (where applicable)

## What's NOT Covered
- Physical damage
- Water damage
- Unauthorized modifications
- Normal wear and tear

To claim warranty, contact us with your order number and issue description.`,
		category: 'Warranty',
		slug: 'product-warranty-info',
		createdAt: new Date('2024-01-05'),
		updatedAt: new Date('2024-01-05'),
		tags: ['warranty', 'guarantee', 'support']
	},
	{
		id: '6',
		title: 'How to track your order?',
		content: `# Order Tracking

Stay updated on your order status!

## Tracking Methods
1. **SMS Updates** - Automatic updates sent to your phone
2. **Email Notifications** - Detailed tracking sent to your email
3. **Contact Support** - Call/message us with your order number

## Order Statuses
- **Processing** - We're preparing your order
- **Shipped** - Your order is on the way
- **Out for Delivery** - Will arrive today
- **Delivered** - Order completed

For real-time updates, save your tracking number provided after purchase.`,
		category: 'Orders',
		slug: 'how-to-track-order',
		createdAt: new Date('2024-01-06'),
		updatedAt: new Date('2024-01-06'),
		tags: ['tracking', 'orders', 'delivery']
	},
	{
		id: '7',
		title: 'Account Security Tips',
		content: `# Account Security

Keep your shopping experience safe!

## Security Best Practices
- Use a strong, unique password
- Enable two-factor authentication
- Don't share your login credentials
- Log out after shopping on shared devices

## Recognizing Scams
- We'll never ask for passwords via email
- Check for HTTPS in the URL
- Verify seller contact information
- Report suspicious activity immediately

Your security is our priority. Contact us if you notice any unusual activity.`,
		category: 'Security',
		slug: 'account-security-tips',
		createdAt: new Date('2024-01-07'),
		updatedAt: new Date('2024-01-07'),
		tags: ['security', 'safety', 'account']
	},
	{
		id: '8',
		title: 'Bulk Order Discounts',
		content: `# Bulk Order Discounts

Save more when you buy more!

## Discount Tiers
- **5-10 items**: 5% discount
- **11-20 items**: 10% discount
- **21-50 items**: 15% discount
- **50+ items**: Contact for special pricing

## How to Order in Bulk
1. Contact our business team
2. Provide product list and quantities
3. Receive custom quote
4. Enjoy bulk pricing

Perfect for businesses, events, or group purchases!`,
		category: 'Discounts',
		slug: 'bulk-order-discounts',
		createdAt: new Date('2024-01-08'),
		updatedAt: new Date('2024-01-08'),
		tags: ['bulk', 'discounts', 'wholesale']
	},
	{
		id: '9',
		title: 'Gift Wrapping Services',
		content: `# Gift Wrapping Services

Make your gifts extra special!

## Available Options
- **Basic Wrapping**: 20,000 VND
- **Premium Wrapping**: 50,000 VND
- **Luxury Wrapping**: 100,000 VND

## Features
- Beautiful gift paper designs
- Personalized message cards
- Ribbon and bow decorations
- Special occasion themes

Simply select gift wrapping at checkout and add your personal message.`,
		category: 'Services',
		slug: 'gift-wrapping-services',
		createdAt: new Date('2024-01-09'),
		updatedAt: new Date('2024-01-09'),
		tags: ['gifts', 'wrapping', 'services']
	},
	{
		id: '10',
		title: 'Customer Loyalty Program',
		content: `# Loyalty Program

Join our VIP customer program!

## Membership Tiers
- **Bronze**: 0-2 million VND spent
- **Silver**: 2-5 million VND spent
- **Gold**: 5-10 million VND spent
- **Platinum**: 10+ million VND spent

## Benefits
- Exclusive discounts
- Early access to new products
- Birthday rewards
- Free shipping upgrades
- Priority customer support

Points never expire! Start earning rewards today.`,
		category: 'Rewards',
		slug: 'customer-loyalty-program',
		createdAt: new Date('2024-01-10'),
		updatedAt: new Date('2024-01-10'),
		tags: ['loyalty', 'rewards', 'vip']
	},
	{
		id: '11',
		title: 'Product Care and Maintenance',
		content: `# Product Care Guide

Keep your products in perfect condition!

## Electronics Care
- Keep away from liquids
- Use proper voltage adapters
- Clean with microfiber cloths
- Store in cool, dry places

## Accessory Maintenance
- Regular cleaning recommended
- Follow manufacturer guidelines
- Use appropriate cleaning products
- Handle with care

Proper maintenance extends product life and maintains warranty coverage.`,
		category: 'Maintenance',
		slug: 'product-care-maintenance',
		createdAt: new Date('2024-01-11'),
		updatedAt: new Date('2024-01-11'),
		tags: ['care', 'maintenance', 'tips']
	},
	{
		id: '12',
		title: 'International Shipping',
		content: `# International Shipping

We ship worldwide!

## Available Countries
- Singapore, Malaysia, Thailand
- USA, Canada, Australia
- Most European countries

## Shipping Rates
- Calculated at checkout
- Based on weight and destination
- Express options available

## Customs and Duties
- Buyer responsible for import fees
- We provide all necessary documentation
- Tracking available for all shipments`,
		category: 'International',
		slug: 'international-shipping',
		createdAt: new Date('2024-01-12'),
		updatedAt: new Date('2024-01-12'),
		tags: ['international', 'shipping', 'global']
	},
	{
		id: '13',
		title: 'Price Match Guarantee',
		content: `# Price Match Guarantee

We offer competitive pricing!

## How It Works
1. Find a lower price elsewhere
2. Send us the competitor's link
3. We'll match or beat the price
4. Enjoy your savings!

## Conditions
- Must be identical product
- In-stock at competitor
- Includes shipping costs
- Excludes clearance items

Valid for 7 days after purchase.`,
		category: 'Pricing',
		slug: 'price-match-guarantee',
		createdAt: new Date('2024-01-13'),
		updatedAt: new Date('2024-01-13'),
		tags: ['price', 'match', 'guarantee']
	},
	{
		id: '14',
		title: 'Pre-Order Information',
		content: `# Pre-Order Guide

Be first to get new products!

## Pre-Order Benefits
- Guaranteed allocation
- Special pre-order pricing
- Exclusive bonuses
- Priority shipping

## Payment
- 50% deposit required
- Balance due before shipping
- Full refund if canceled

## Delivery
- Estimated dates provided
- First come, first served
- Updates via email/SMS`,
		category: 'Pre-Orders',
		slug: 'pre-order-information',
		createdAt: new Date('2024-01-14'),
		updatedAt: new Date('2024-01-14'),
		tags: ['preorder', 'new', 'products']
	},
	{
		id: '15',
		title: 'Student Discounts',
		content: `# Student Discount Program

Special pricing for students!

## Eligibility
- Valid student ID required
- Enrolled in accredited institution
- One account per student

## Discount Details
- 10% off all products
- Stackable with sale prices
- Excludes already discounted items

## How to Apply
1. Verify student status
2. Receive discount code
3. Apply at checkout
4. Save on every purchase!`,
		category: 'Discounts',
		slug: 'student-discounts',
		createdAt: new Date('2024-01-15'),
		updatedAt: new Date('2024-01-15'),
		tags: ['students', 'discount', 'education']
	},
	{
		id: '16',
		title: 'Corporate Sales',
		content: `# Corporate Sales

Solutions for your business needs!

## Services Offered
- Bulk purchasing
- Custom configurations
- Net payment terms
- Dedicated account manager

## Benefits
- Volume discounts
- Priority support
- Custom invoicing
- Flexible payment options

Contact our B2B team for personalized service and competitive quotes.`,
		category: 'Business',
		slug: 'corporate-sales',
		createdAt: new Date('2024-01-16'),
		updatedAt: new Date('2024-01-16'),
		tags: ['corporate', 'b2b', 'business']
	},
	{
		id: '17',
		title: 'Product Authenticity',
		content: `# Product Authenticity Guarantee

100% genuine products!

## Our Promise
- Authorized retailer only
- Direct from manufacturers
- Full warranty coverage
- Authenticity certificates

## Verification
- Check serial numbers
- Scan QR codes
- Verify holograms
- Contact manufacturer

We guarantee all products are 100% authentic or your money back!`,
		category: 'Quality',
		slug: 'product-authenticity',
		createdAt: new Date('2024-01-17'),
		updatedAt: new Date('2024-01-17'),
		tags: ['authentic', 'genuine', 'quality']
	},
	{
		id: '18',
		title: 'Eco-Friendly Packaging',
		content: `# Eco-Friendly Initiative

We care about the environment!

## Our Commitment
- Recyclable packaging materials
- Minimal plastic use
- Biodegradable fillers
- Reusable boxes

## Customer Participation
- Return packaging for reuse
- Earn green points
- Support sustainability
- Reduce waste together

Join us in protecting our planet!`,
		category: 'Environment',
		slug: 'eco-friendly-packaging',
		createdAt: new Date('2024-01-18'),
		updatedAt: new Date('2024-01-18'),
		tags: ['eco', 'green', 'packaging']
	},
	{
		id: '19',
		title: 'Technical Support',
		content: `# Technical Support

Expert help when you need it!

## Support Channels
- Live chat: 9 AM - 9 PM
- Email: support@shineshop.org
- Phone: 1800-SHINE
- Remote assistance available

## Services
- Product setup help
- Troubleshooting
- Software updates
- Configuration guidance

Our tech experts are here to ensure you get the most from your purchase!`,
		category: 'Support',
		slug: 'technical-support',
		createdAt: new Date('2024-01-19'),
		updatedAt: new Date('2024-01-19'),
		tags: ['support', 'technical', 'help']
	},
	{
		id: '20',
		title: 'Referral Program',
		content: `# Referral Rewards

Share and earn!

## How It Works
1. Share your referral code
2. Friends get 5% discount
3. You earn 5% commission
4. No limits on earnings!

## Rewards
- Cash payments monthly
- Store credit options
- Bonus tiers for top referrers
- Exclusive referrer perks

Start earning by sharing Shine Shop with friends and family today!`,
		category: 'Rewards',
		slug: 'referral-program',
		createdAt: new Date('2024-01-20'),
		updatedAt: new Date('2024-01-20'),
		tags: ['referral', 'rewards', 'earn']
	}
]

export const initialSocialLinks: SocialLink[] = [
	{
		id: '1',
		platform: 'Facebook',
		url: 'https://facebook.com/shineshop',
		icon: 'facebook'
	},
	{
		id: '2',
		platform: 'Instagram',
		url: 'https://instagram.com/shineshop',
		icon: 'instagram'
	},
	{
		id: '3',
		platform: 'Twitter',
		url: 'https://twitter.com/shineshop',
		icon: 'twitter'
	},
	{
		id: '4',
		platform: 'WhatsApp',
		url: 'https://wa.me/84123456789',
		icon: 'message-circle'
	},
	{
		id: '5',
		platform: 'Telegram',
		url: 'https://t.me/shineshop',
		icon: 'send'
	},
	{
		id: '6',
		platform: 'YouTube',
		url: 'https://youtube.com/@shineshop',
		icon: 'youtube'
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