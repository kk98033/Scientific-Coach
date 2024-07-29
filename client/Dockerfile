# 使用官方 Node.js 圖像
FROM node:16

# 設置工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製所有源文件，包括 public 文件夾
COPY . .

# 構建前端應用
RUN npm run build

# 安裝 serve 以提供構建的應用
RUN npm install -g serve

# 複製 entrypoint 腳本
COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

# 暴露應用運行的端口
EXPOSE 8080

# 使用 entrypoint 腳本啟動服務
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["serve", "-s", "dist", "-l", "8080"]
