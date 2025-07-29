#!/bin/bash
# Render build script for frontend

echo "🔧 Installing frontend dependencies..."
npm install

echo "🔨 Building Next.js application..."
npm run build

echo "✅ Frontend build completed!"
