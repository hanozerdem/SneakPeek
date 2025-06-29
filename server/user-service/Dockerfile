# Resmi Node.js imajını kullan
FROM node:20-alpine

# Çalışma dizini oluştur
WORKDIR /usr/src/app

# Bağımlılıkları kopyala ve yükle
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Uygulama dosyalarını kopyala
COPY . .

# Uygulamayı build et
RUN npm run build

# Uygulamanın çalışacağı port

# Uygulamayı başlat
CMD ["npm", "run", "start:prod"]
