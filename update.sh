#!/bin/bash

echo "🚀 Start update proces voor Ruimte Rekenen..."

# Stop de huidige app
echo "📋 Stop de huidige app..."
pm2 stop ruimte-rekenen

# Verwijder build directories
echo "🗑️  Verwijder oude build bestanden..."
rm -rf .next node_modules

# Pull nieuwe code
echo "⬇️  Download nieuwe code..."
git pull

# Installeer dependencies en bouw opnieuw
echo "🏗️  Installeer dependencies..."
npm install

echo "🔨 Bouw de app..."
npm run build

# Start de app opnieuw
echo "✨ Start de app opnieuw..."
pm2 start npm --name "ruimte-rekenen" -- start

echo "✅ Update voltooid! De app draait nu op http://localhost:3000"