# Deployment Instructions for Cloudflare Pages

## Prerequisites
- A GitHub account
- A Cloudflare account
- Git installed on your machine

## Steps to Deploy

### 1. Push to GitHub
```bash
# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/shineshop-website.git

# Push your code
git push -u origin main
```

### 2. Connect to Cloudflare Pages

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** > **Create application** > **Pages**
3. Select **Connect to Git**
4. Choose your GitHub account and select the `shineshop-website` repository
5. Click **Begin setup**

### 3. Configure Build Settings

Use these settings in Cloudflare Pages:

- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/` (leave empty)
- **Environment variables**: None required

### 4. Deploy

1. Click **Save and Deploy**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be available at `https://shineshop-website.pages.dev`

### 5. Custom Domain (Optional)

To use a custom domain:

1. Go to your Pages project settings
2. Click **Custom domains**
3. Add your domain
4. Follow the DNS configuration instructions

## Automatic Deployments

After the initial setup, every push to the `main` branch will automatically trigger a new deployment.

## Build Issues

If you encounter build issues:

1. Check the build logs in Cloudflare Pages dashboard
2. Ensure all dependencies are listed in `package.json`
3. Try building locally first with `npm run build`

## Local Testing

Before deploying, always test locally:

```bash
# Build the project
npm run build

# Test the production build
npm start
```

Visit `http://localhost:3000` to test the production build locally. 