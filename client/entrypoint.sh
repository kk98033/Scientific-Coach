#!/bin/sh

# 輸出環境變數以進行調試
echo "SOCKET_IP: ${SOCKET_IP}"

# 替換佔位符為環境變數值
sed -i "s/%%SOCKET_IP%%/${SOCKET_IP}/g" /usr/src/app/dist/index.html

# 檢查替換結果
echo "index.html after replacement:"
cat /usr/src/app/dist/index.html | grep SOCKET_IP

# 啟動服務
exec "$@"
