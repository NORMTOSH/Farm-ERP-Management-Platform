#!/bin/bash

# Farm ERP Platform - Supabase Setup Script
# This script helps you set up the Supabase backend for the Farm ERP Platform

set -e

echo "🚀 Farm ERP Platform - Supabase Setup"
echo "======================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Prompt for project details
read -p "Enter your Supabase project ID: " PROJECT_ID
read -p "Enter your Supabase project URL (e.g., https://xxx.supabase.co): " SUPABASE_URL
read -p "Enter your Supabase anon key: " SUPABASE_ANON_KEY

# Link project
echo ""
echo "🔗 Linking to Supabase project..."
supabase link --project-ref "$PROJECT_ID"

# Push migrations
echo ""
echo "📤 Pushing database migrations..."
supabase db push

# Seed database (optional)
read -p "Do you want to seed the database with sample data? (y/n): " SEED
if [ "$SEED" = "y" ] || [ "$SEED" = "Y" ]; then
    echo "🌱 Seeding database..."
    supabase db seed
fi

# Update .env file
echo ""
echo "📝 Updating .env file..."
sed -i.bak "s|your-project-url|$SUPABASE_URL|g" .env
sed -i.bak "s|your-anon-key-here|$SUPABASE_ANON_KEY|g" .env
rm .env.bak

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Open http://localhost:5173 in your browser"
echo "3. Sign up for a new account"
echo ""
echo "To apply migrations later, run:"
echo "   supabase db push"
echo ""
echo "To view your database in Supabase Studio:"
echo "   supabase studio"
