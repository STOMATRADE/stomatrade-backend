# Quick Start Guide

## Setup dalam 5 Menit

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Neon Database

#### Option A: Automated Setup (Recommended)
```bash
./scripts/setup-neon-db.sh
```

#### Option B: Manual Setup
1. Visit: https://console.neon.tech
2. Create project: `stomatrade-backend`
3. Copy connection string
4. Update .env:
```bash
cp .env.example .env
# Edit .env and paste your Neon connection string
```

### 3. Generate Prisma Client & Migrate
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run Application
```bash
pnpm run start:dev
```

### 5. Akses Swagger UI
Buka browser:
```
http://localhost:3000/api
```

## Testing API dengan Swagger

### Test 1: Create User
1. Buka Swagger UI: `http://localhost:3000/api`
2. Expand **users** tag
3. Klik **POST /users**
4. Klik **Try it out**
5. Request body akan terisi otomatis:
```json
{
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "role": "COLLECTOR"
}
```
6. Klik **Execute**
7. Lihat response 201 dengan user yang baru dibuat
8. **Copy `id` dari response untuk test selanjutnya**

### Test 2: Get All Users
1. Klik **GET /users**
2. Klik **Try it out**
3. (Optional) Set page=1, limit=10
4. Klik **Execute**
5. Lihat paginated response dengan user yang baru dibuat

### Test 3: Get User by ID
1. Klik **GET /users/{id}**
2. Klik **Try it out**
3. Paste ID dari Test 1
4. Klik **Execute**
5. Lihat detail user

### Test 4: Update User
1. Klik **PATCH /users/{id}**
2. Klik **Try it out**
3. Paste ID
4. Edit request body:
```json
{
  "role": "ADMIN"
}
```
5. Klik **Execute**
6. Lihat user dengan role yang sudah diupdate

### Test 5: Create Complete Flow

#### Step 1: Create Collector
```json
POST /collectors
{
  "userId": "<paste user ID dari Test 1>",
  "nik": "3201234567890123",
  "name": "John Collector",
  "address": "Jl. Raya No. 123, Jakarta"
}
```
Copy `collectorId` dari response

#### Step 2: Create Farmer
```json
POST /farmers
{
  "collectorId": "<paste collector ID>",
  "tokenId": 1001,
  "nik": "3201234567890124",
  "name": "Farmer Jane",
  "age": 35,
  "gender": "FEMALE",
  "address": "Desa Makmur, Kec. Subur"
}
```
Copy `farmerId` dari response

#### Step 3: Create Land
```json
POST /lands
{
  "farmerId": "<paste farmer ID>",
  "tokenId": 2001,
  "latitude": -6.200000,
  "longitude": 106.816666,
  "address": "Plot A1, Desa Makmur"
}
```
Copy `landId` dari response

#### Step 4: Create Project
```json
POST /projects
{
  "tokenId": 3001,
  "commodity": "Rice",
  "volume": 1000.5,
  "gradeQuality": "A",
  "farmerId": "<paste farmer ID>",
  "landId": "<paste land ID>",
  "sendDate": "2025-02-15T08:00:00.000Z"
}
```

#### Step 5: Verify Relationships
```
GET /farmers/collector/{collectorId}  - Lihat farmers by collector
GET /lands/farmer/{farmerId}          - Lihat lands by farmer
GET /projects/farmer/{farmerId}       - Lihat projects by farmer
GET /projects/land/{landId}           - Lihat projects by land
```

## Database Management

### View Database in Prisma Studio
```bash
npx prisma studio
```
Buka: `http://localhost:5555`

### Reset Database (DANGER!)
```bash
npx prisma migrate reset
```

### Create New Migration
```bash
npx prisma migrate dev --name your_migration_name
```

## Available Scripts

```bash
# Development
pnpm run start:dev          # Run in watch mode

# Production
pnpm run build              # Build application
pnpm run start:prod         # Run production build

# Testing
pnpm run test               # Run unit tests
pnpm run test:e2e           # Run e2e tests
pnpm run test:cov           # Test coverage

# Database
npx prisma generate         # Generate Prisma Client
npx prisma migrate dev      # Run migrations
npx prisma studio           # Open Prisma Studio
npx prisma db push          # Push schema without migration
```

## Common Endpoints

### Users
- `POST /users` - Create user
- `GET /users` - Get all users (paginated)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Soft delete user

### Collectors
- `POST /collectors` - Create collector
- `GET /collectors` - Get all collectors
- `GET /collectors/:id` - Get collector by ID
- `PATCH /collectors/:id` - Update collector
- `DELETE /collectors/:id` - Delete collector

### Farmers
- `POST /farmers` - Create farmer
- `GET /farmers` - Get all farmers
- `GET /farmers/collector/:collectorId` - Get farmers by collector
- `GET /farmers/:id` - Get farmer by ID
- `PATCH /farmers/:id` - Update farmer
- `DELETE /farmers/:id` - Delete farmer

## Tips

1. **Swagger is your friend** - Semua endpoint terdokumentasi dengan contoh
2. **Copy IDs** - Save IDs dari response untuk relasi
3. **Check schemas** - Scroll ke bawah di Swagger untuk lihat semua schemas
4. **Pagination works everywhere** - Semua list endpoint support `?page=1&limit=10`
5. **Soft delete** - DELETE tidak benar-benar hapus data, hanya set `deleted=true`
6. **UUID format** - Semua ID menggunakan UUID v4 format

## Next Steps

1. ✅ Setup database
2. ✅ Run aplikasi
3. ✅ Test dengan Swagger
4. 📖 Baca [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) untuk detail lengkap
5. 📖 Baca [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) untuk tips Swagger
6. 🚀 Build your frontend!

## Troubleshooting

### Database connection error
```bash
# Check PostgreSQL running
sudo systemctl status postgresql

# Check DATABASE_URL in .env
cat .env
```

### Prisma Client not found
```bash
npx prisma generate
```

### Port 3000 already in use
```bash
# Change PORT in .env
echo "PORT=3001" >> .env
```

### Swagger not loading
- Make sure app is running
- Go to `http://localhost:3000/api` (not /swagger)
- Check browser console for errors

## Support

- 📖 [README.md](./README.md) - Full documentation
- 📖 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- 📖 [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) - Swagger tips
- 🐛 Create issue for bugs
