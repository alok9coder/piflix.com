#!/usr/bin/bash

sleep 30s

sudo apt-get update

sudo apt-get upgrade -y

echo "STARTING HTTPS SERVER!"

sleep 5s

echo "piflix.com"

echo "HTTPS SERVER RUNNING!"

echo $(ifconfig | grep broadcast | awk '{print $2}')

sleep 5s

cd /home/pi/Media-Streaming-App/ && nodemon app.js

