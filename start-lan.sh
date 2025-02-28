#!/bin/bash

# Krijg het lokale IP-adres
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}')

echo "Starting the app on $IP:3000"
echo "You can access the app from other devices on your network using:"
echo "http://$IP:3000"

# Start de app op alle netwerkinterfaces
HOST=0.0.0.0 npm run start