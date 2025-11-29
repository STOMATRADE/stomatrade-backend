# StoMaTrade Backend API

Backend API untuk aplikasi StoMaTrade - platform manajemen supply chain untuk komoditas pertanian.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: class-validator & class-transformer
- **Language**: TypeScript

## Features

- CRUD operations untuk semua entitas (Users, Collectors, Farmers, Lands, Files, Buyers, Projects, Notifications)
- Soft delete untuk semua data
- Pagination untuk semua list endpoints
- Global validation
- CORS enabled
- Relational database dengan foreign keys

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- pnpm (atau npm/yarn)

## Installation

1. Clone repository
```bash
git clone <repository-url>
cd stomatrade-backend-v2
```

2. Install dependencies
```bash
pnpm install
```

3. Setup environment variables
```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi database Anda:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/stomatrade?schema=public"
PORT=3000
NODE_ENV=development
```

4. Generate Prisma Client
```bash
npx prisma generate
```

5. Run database migrations
```bash
npx prisma migrate dev --name init
```

## Running the Application

### Development Mode
```bash
pnpm run start:dev
```

### Production Mode
```bash
pnpm run build
pnpm run start:prod
```

### Debug Mode
```bash
pnpm run start:debug
```

Aplikasi akan berjalan di `http://localhost:3000`

## Database Management

### Create a new migration
```bash
npx prisma migrate dev --name migration_name
```

### Reset database (DANGER: akan menghapus semua data)
```bash
npx prisma migrate reset
```

### Open Prisma Studio (Database GUI)
```bash
npx prisma studio
```

### Seed database (optional)
Buat file `prisma/seed.ts` untuk data awal, kemudian jalankan:
```bash
npx prisma db seed
```

## API Documentation

### Swagger UI (Interactive Documentation)

Setelah menjalankan aplikasi, Anda dapat mengakses Swagger UI untuk testing API di:

```
http://localhost:3000/api
```

Swagger UI menyediakan:
- Interactive API testing
- Request/Response schemas  
- Try it out feature untuk test langsung
- Automatic validation

### Dokumentasi Tertulis


Dokumentasi lengkap API tersedia di file [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Endpoints Overview

- **Users**: `/users`
- **Collectors**: `/collectors`
- **Farmers**: `/farmers`
- **Lands**: `/lands`
- **Files**: `/files`
- **Buyers**: `/buyers`
- **Buyer History**: `/buyers/history`
- **Projects**: `/projects`
- **Notifications**: `/notifications`

Semua endpoints mendukung:
- Pagination dengan query params `?page=1&limit=10`
- Soft delete (data tidak benar-benar dihapus)
- Validation otomatis

## Project Structure

```
src/
├── common/
│   └── dto/
│       └── pagination.dto.ts          # Shared DTOs
├── modules/
│   ├── users/
│   │   ├── dto/                       # Data Transfer Objects
│   │   ├── users.controller.ts        # HTTP routes
│   │   ├── users.service.ts           # Business logic
│   │   └── users.module.ts            # Module definition
│   ├── collectors/
│   ├── farmers/
│   ├── lands/
│   ├── files/
│   ├── buyers/
│   ├── projects/
│   └── notifications/
├── prisma/
│   ├── prisma.service.ts              # Prisma client service
│   └── prisma.module.ts               # Global Prisma module
├── app.module.ts                      # Root module
└── main.ts                            # Application entry point

prisma/
└── schema.prisma                      # Database schema definition
```

## Testing

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov
```

## Database Schema

### Enums
- **ROLES**: `ADMIN`, `STAFF`, `INVESTOR`, `COLLECTOR`
- **GENDER**: `MALE`, `FEMALE`

### Main Tables
- **User**: User accounts dengan wallet address
- **Collector**: Pengumpul yang terhubung dengan User
- **Farmer**: Petani yang terhubung dengan Collector
- **Land**: Lahan milik Farmer
- **File**: File attachments untuk berbagai entitas
- **Buyer**: Pembeli/perusahaan
- **BuyerHistory**: Riwayat transaksi Buyer
- **Project**: Project pertanian
- **ChannelNotification**: Channel untuk notifikasi
- **Notification**: Notifikasi yang dikirim
- **TokenNotification**: FCM token untuk push notification

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `PORT` | Application port | 3000 |
| `NODE_ENV` | Environment mode | development |

## Common Issues

### Error: Prisma Client not generated
```bash
npx prisma generate
```

### Error: Database connection refused
Pastikan PostgreSQL berjalan dan credentials di `.env` benar

### Error: Migration failed
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## API Examples

### Create User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "role": "COLLECTOR"
  }'
```

### Get All Users with Pagination
```bash
curl http://localhost:3000/users?page=1&limit=10
```

### Create Farmer
```bash
curl -X POST http://localhost:3000/farmers \
  -H "Content-Type: application/json" \
  -d '{
    "collectorId": "uuid-here",
    "tokenId": 1001,
    "nik": "3201234567890124",
    "name": "Farmer Jane",
    "age": 35,
    "gender": "FEMALE",
    "address": "Desa Makmur"
  }'
```

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

[MIT License](LICENSE)

## Support

Untuk pertanyaan dan dukungan, silakan buat issue di repository ini.
