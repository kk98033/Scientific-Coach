# 使用官方 Node.js 圖像
FROM node:16

# 設置工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製所有源文件
COPY . .

# 暴露應用運行的端口
EXPOSE 3000

# 啟動應用
CMD ["node", "server.js"]
