#!/usr/bin/bash

sleep 2s

sudo apt-get update

sudo apt-get upgrade -y

sudo mount -t ntfs /dev/sdb1 /mnt/huge

echo "STARTING HTTPS SERVER!"

sleep 2s

echo "piflix.com"

echo "HTTPS SERVER RUNNING!"

echo $(sudo ifconfig | grep broadcast | awk '{print $2}')

sleep 2s

cd /home/pi/Media-Streaming-App/ && nodemon app.js & disown

