# Neon Database Setup Guide

## Step 1: Login ke Neon (jika belum)
```bash
npx neonctl auth
```

## Step 2: Create Neon Project
```bash
npx neonctl projects create --name stomatrade-backend
```

Atau melalui web:
1. Buka https://console.neon.tech
2. Create New Project
3. Name: `stomatrade-backend`
4. Region: Pilih yang terdekat (Singapore recommended untuk Indonesia)
5. Postgres Version: 16

## Step 3: Get Connection String
```bash
# List projects
npx neonctl projects list

# Get connection string for specific project
npx neonctl connection-string --project-id <your-project-id>
```

Atau dari Neon Console:
1. Buka project di https://console.neon.tech
2. Go to Dashboard
3. Copy "Connection String"
4. Format: `postgresql://username:password@host/database?sslmode=require`

## Step 4: Update .env
Paste connection string ke file `.env`:

```env
# Neon Database Connection
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Optional: Direct URL untuk migrations (tanpa pooling)
DIRECT_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

PORT=3000
NODE_ENV=development
```

## Step 5: Update Prisma Schema
File `prisma/schema.prisma` sudah dikonfigurasi untuk Neon.

Jika belum, pastikan ada:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Step 6: Run Migrations
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (untuk development cepat)
npx prisma db push

# Atau create migration (untuk production)
npx prisma migrate dev --name init
```

## Step 7: Verify Connection
```bash
# Open Prisma Studio
npx prisma studio

# Atau test connection
npx prisma db pull
```

## Step 8: Run Application
```bash
pnpm run start:dev
```

Access Swagger UI: http://localhost:3000/api

## Troubleshooting

### Error: P1001 - Can't reach database server
- Check DATABASE_URL is correct
- Ensure `?sslmode=require` is added
- Check network/firewall

### Error: P3009 - Failed to create migration
Use `npx prisma db push` instead for development

### Error: Pool timeout
Add connection pooling params:
```
?sslmode=require&pgbouncer=true&connection_limit=10
```

## Neon Features

### Connection Pooling
Neon provides automatic connection pooling. For best performance:

**For Application (with pooling):**
```
postgresql://user:pass@host/db?sslmode=require&pgbouncer=true
```

**For Migrations (direct):**
```
postgresql://user:pass@host/db?sslmode=require
```

### Branching
Create database branches for development:
```bash
npx neonctl branches create --name dev
```

### Autoscaling
Neon automatically scales based on usage.

### Backups
Automatic continuous backups - no config needed.

## Quick Commands

```bash
# Create project
npx neonctl projects create --name stomatrade-backend

# Get connection string
npx neonctl connection-string

# List databases
npx neonctl databases list

# Create branch
npx neonctl branches create --name development

# Delete branch
npx neonctl branches delete <branch-name>
```

## Next Steps

1. ✅ Setup Neon project
2. ✅ Update .env with connection string
3. ✅ Run migrations
4. 🚀 Start building!
