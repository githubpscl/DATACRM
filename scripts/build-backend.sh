#!/bin/bash
# Render build script for backend

echo "🔧 Installing backend dependencies..."
cd backend
npm install

echo "🔨 Building backend..."
npm run build

echo "📦 Setting up database..."
npm run migrate

echo "🌱 Seeding database with initial data..."
npm run seed

echo "✅ Backend build completed!"
