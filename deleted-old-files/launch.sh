#!/bin/bash

echo "🚀 Launching IndaStreet Massage Platform from GitHub"

# Clone the repository
git clone https://github.com/Philip2024394/website-massage-.git
cd website-massage-

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file
echo "🔧 Setting up environment..."
cp .env.example .env

# Build the project
echo "🏗️  Building project..."
npm run build:vercel

# Start development server (optional)
echo "🌟 Starting development server..."
npm run dev

echo "✅ Launch complete!"
echo "🌐 Local: http://localhost:3001"
echo "🚀 Production: https://massagewebsiteindastreet-7xi4kxkgo.vercel.app"