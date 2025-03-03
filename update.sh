#!/bin/bash

# Kleuren voor output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Git toevoegen...${NC}"
git add .

echo -e "${YELLOW}2. Git commit...${NC}"
read -p "Voer je commit message in: " commit_message
git commit -m "$commit_message"

echo -e "${YELLOW}3. Push naar GitHub...${NC}"
git push origin main

echo -e "${YELLOW}4. Update app op server...${NC}"
ssh root@rekenapp << 'EOF'
  cd /opt/kids-game-rekenen

  echo "Reset lokale wijzigingen..."
  git reset --hard HEAD

  echo "Pull nieuwe wijzigingen..."
  git pull origin main

  echo "Installeer dependencies..."
  npm install

  echo "Build de applicatie..."
  npm run build

  echo "Zorg voor juiste permissies data directory..."
  mkdir -p data
  chown -R www-data:www-data data
  chmod 755 data

  echo "Herstart de applicatie..."
  pm2 restart kids-game-rekenen

  echo "App succesvol bijgewerkt!"
EOF

echo -e "${GREEN}Klaar! De app is bijgewerkt op GitHub en de server.${NC}"