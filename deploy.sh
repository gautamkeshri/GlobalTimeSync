#!/bin/bash
# Quick deployment script for Cloudflare Workers and Pages

set -e

echo "🚀 Starting Cloudflare deployment..."
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Install it with: npm install -g wrangler"
    exit 1
fi

# Check if logged in to Cloudflare
echo "📋 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Run: wrangler login"
    exit 1
fi

echo "✅ Cloudflare authentication verified"
echo ""

# Build the worker
echo "🔨 Building Cloudflare Worker..."
npm run build:worker

if [ $? -ne 0 ]; then
    echo "❌ Worker build failed"
    exit 1
fi

echo "✅ Worker built successfully"
echo ""

# Build the frontend
echo "🔨 Building frontend for Cloudflare Pages..."
npm run build:pages

if [ $? -ne 0 ]; then
    echo "❌ Pages build failed"
    exit 1
fi

echo "✅ Frontend built successfully"
echo ""

# Deploy the worker
echo "🚀 Deploying Worker to Cloudflare..."
npm run deploy:worker

if [ $? -ne 0 ]; then
    echo "❌ Worker deployment failed"
    exit 1
fi

echo "✅ Worker deployed successfully"
echo ""

# Deploy to Pages
echo "🚀 Deploying to Cloudflare Pages..."
npm run deploy:pages

if [ $? -ne 0 ]; then
    echo "❌ Pages deployment failed"
    exit 1
fi

echo "✅ Pages deployed successfully"
echo ""

echo "🎉 Deployment complete!"
echo ""
echo "📍 Your app is now live:"
echo "   Worker API: Check Cloudflare dashboard for URL"
echo "   Frontend: Check Cloudflare Pages dashboard for URL"
echo ""
echo "📚 Next steps:"
echo "   1. Visit Cloudflare dashboard to get your URLs"
echo "   2. Configure custom domains (optional)"
echo "   3. Set up environment variables for Firebase (if needed)"
echo "   4. Test your deployment"
echo ""
