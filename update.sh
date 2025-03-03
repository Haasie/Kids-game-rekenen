#!/bin/bash

# Kleuren voor output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functie voor error handling
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
}

# Check of we in de juiste directory zijn
if [ ! -f "package.json" ]; then
    handle_error "package.json niet gevonden. Zorg dat je in de project root directory bent."
fi

echo -e "${YELLOW}1. Git toevoegen...${NC}"
git add .

echo -e "${YELLOW}2. Git commit...${NC}"
read -p "Voer je commit message in: " commit_message
git commit -m "$commit_message"

echo -e "${YELLOW}3. Push naar GitHub...${NC}"
git push origin main || handle_error "Git push mislukt"

echo -e "${YELLOW}4. Update app op server...${NC}"
ssh -T root@192.168.1.18 << 'EOF' || handle_error "SSH verbinding mislukt"
set -e # Stop bij eerste error

cd /opt/kids-game-rekenen || exit 1

echo "Maak backup van scores..."
cp -f data/scores.json data/scores.json.backup 2>/dev/null || true

echo "Reset lokale wijzigingen..."
git reset --hard HEAD

echo "Pull nieuwe wijzigingen..."
git pull origin main

echo "Controleer Node.js versie..."
node -v | grep -q "v18" || exit 1

echo "Schone installatie van dependencies..."
rm -rf node_modules .next package-lock.json
npm install --no-audit

echo "Build de applicatie..."
npm run build

echo "Zorg voor juiste permissies data directory..."
mkdir -p data
chown -R www-data:www-data data
chmod 755 data

echo "Herstel scores backup..."
mv -f data/scores.json.backup data/scores.json 2>/dev/null || true

echo "Herstart de applicatie..."
pm2 restart kids-game-rekenen

# Wacht even en check of de app nog draait
sleep 5
pm2 show kids-game-rekenen | grep -q "online" || exit 1

echo "App succesvol bijgewerkt!"
EOF

# Check deployment status
echo -e "${YELLOW}5. Controleer deployment...${NC}"
sleep 2 # Wacht even tot de app volledig is opgestart
curl -s http://rekenapp:3000 > /dev/null || handle_error "App lijkt niet bereikbaar"

echo -e "${GREEN}Klaar! De app is succesvol bijgewerkt op GitHub en de server.${NC}"