# Shine Shop Website

A modern e-commerce website built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## Features

- 🛍️ Product catalog with categories and filtering
- 📱 Fully responsive design
- 🌙 Dark/Light mode support
- 🌐 Multi-language support (English/Vietnamese)
- 🔐 Admin dashboard for content management
- 💳 Payment information with VietQR integration
- 📖 FAQ system with search functionality
- 🔗 Social media links
- 🛠️ Utility tools (2FA decoder, etc.)
- 💾 Persistent data storage across browsers

## Tech Stack

- **Framework**: Next.js 15.1.3
- **React**: 19.0.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Shadcn/UI with Radix UI
- **Icons**: Lucide React
- **Markdown**: React Markdown
- **Data Storage**: File System (dev) / Cloudflare KV (production)

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/shineshop-website.git
cd shineshop-website
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

To access the admin dashboard:

1. Navigate to `/admin`
2. Use the following credentials:
   - Username: `admin`
   - Password: `shineshop2024`

**Important**: Change these credentials in production!

## Project Structure

```
shineshop-website/
├── app/
│   ├── components/      # Reusable components
│   ├── lib/            # Utilities and configurations
│   ├── hooks/          # Custom React hooks
│   ├── store/          # Store pages
│   ├── faq/            # FAQ pages
│   ├── payment/        # Payment page
│   ├── social/         # Social links page
│   ├── tos/            # Terms of Service
│   ├── service/        # Service tools
│   └── admin/          # Admin dashboard
├── public/             # Static assets
└── ...
```

## Deployment

### Cloudflare Pages

1. Build the project:
```bash
npm run build
```

2. The output will be in the `.next` directory.

3. Deploy to Cloudflare Pages with the following settings:
   - Build command: `npm run build`
   - Build output directory: `.next`

## Environment Variables

No environment variables are required for basic functionality. All configuration is managed through the admin dashboard.

## Data Persistence

The website uses a dual storage system for data persistence:

### Development Environment
- Data is stored in `data/store-data.json` file
- Automatic backups are created (keeps last 5 backups)
- Changes are immediately persisted to disk

### Production Environment (Cloudflare)
- Uses Cloudflare KV Storage for persistent data
- Data is synchronized across all sessions globally
- Automatic backups with 7-day retention

### Features
- **Automatic Sync**: Data syncs every 30 seconds
- **Cross-Browser**: Changes in one browser appear in all others
- **Backup System**: Automatic backups prevent data loss
- **Instant Updates**: Changes are saved immediately

### Setup for Cloudflare KV
See [Cloudflare KV Setup Guide](docs/cloudflare-kv-setup.md) for detailed instructions.

## Features Overview

### Store
- Product gallery with categories
- Product detail pages with options
- Auto-scroll to products on page load
- 3D card hover effects

### Admin Dashboard
- Product management (CRUD operations)
- FAQ article management
- Site configuration
- Payment information settings
- Terms of Service editor

### Payment
- VietQR integration
- Bank account information display
- Copy functionality for easy transfers

### Multi-language Support
- English and Vietnamese languages
- Easy switching via navbar toggle

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@shineshop.org or visit our FAQ section. 