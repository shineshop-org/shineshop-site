# Deployment Instructions for Shine Shop

## Cloudflare Pages Deployment

### Prerequisites
- GitHub account
- Cloudflare account
- Repository with the Shine Shop site code

### Setup Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "feat: prepare for cloudflare pages deployment"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**
   - Log in to your Cloudflare dashboard
   - Navigate to Pages
   - Click "Create a project"
   - Select "Connect to Git"
   - Authorize Cloudflare to access your GitHub repositories
   - Select the repository containing the Shine Shop site

3. **Configure Build Settings**
   - Set the following build configuration:
     - Production branch: `main`
     - Build command: `npm run export`
     - Build output directory: `out`
     - Node.js version: `20`

4. **Environment Variables**
   - No additional environment variables are required for the basic deployment

5. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare will automatically build and deploy your site

### Important Notes

- The `/admin` route is protected and will not be accessible in production
- All static assets are optimized for Cloudflare's CDN
- The site uses static export for maximum performance
- The theme switch animation works in both production and development

### Updating the Site

To update the site after making changes:

1. Make your changes locally
2. Test in development mode with `npm run dev`
3. Commit and push your changes to GitHub
4. Cloudflare Pages will automatically detect the changes and redeploy

### Troubleshooting

- If images are not displaying, check that they exist in the `/public` directory
- If the theme switch is not working, check browser console for errors
- If routes are not working, verify the `_routes.json` configuration
- For any other issues, check the Cloudflare Pages build logs 