# Base image
FROM node:20

# Instal pnpm menggunakan npm
# RUN npm config rm proxy
# RUN npm config rm https-proxy
RUN npm install -g pnpm

# Set direktori kerja dalam kontainer
WORKDIR /app
# ENV NODE_OPTIONS=--openssl-legacy-provider

# Salin package.json dan pnpm-lock.yaml ke dalam kontainer
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependensi proyek
RUN pnpm install 
# --install.no-lockfile true

# Salin semua file proyek ke dalam kontainer
COPY . .

# Build aplikasi
RUN pnpm prisma:generate
RUN pnpm build

# Expose port yang akan digunakan
EXPOSE 3000

# Jalankan aplikasi ketika kontainer dijalankan
CMD ["pnpm", "start"]
