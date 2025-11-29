# ✅ Neon Database Setup Complete!

## Database Information

**Database**: Stomatrade  
**Provider**: Neon (PostgreSQL Serverless)  
**Region**: ap-southeast-1 (Singapore)  
**Connection**: Pooled with PgBouncer  

## Configuration

### Environment Variables (.env)
```env
# Pooled connection for application
DATABASE_URL="postgresql://neondb_owner:***@ep-broad-wave-a1egjco6-pooler.ap-southeast-1.aws.neon.tech/Stomatrade?sslmode=require"

# Direct connection for migrations
DIRECT_URL="postgresql://neondb_owner:***@ep-broad-wave-a1egjco6.ap-southeast-1.aws.neon.tech/Stomatrade?sslmode=require"
```

### Prisma Configuration (prisma.config.ts)
```typescript
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    url: env("DIRECT_URL"),  // Uses direct connection for migrations
  },
  datasource: {
    url: env("DATABASE_URL"),  // Uses pooled connection for app
  },
});
```

## Database Schema

✅ All tables created successfully:

- ✅ users
- ✅ collectors  
- ✅ farmers
- ✅ lands
- ✅ files
- ✅ buyers
- ✅ buyer_histories
- ✅ projects
- ✅ channel_notifications
- ✅ notifications
- ✅ token_notifications

## Next Steps

### 1. Start the Application
```bash
pnpm run start:dev
```

### 2. Access Swagger UI
```
http://localhost:3000/api
```

### 3. Test API Endpoints

Create your first user:
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "role": "COLLECTOR"
  }'
```

### 4. View Database in Prisma Studio
```bash
npx prisma studio
```

### 5. View Database in Neon Console
Visit: https://console.neon.tech/app/projects/ep-broad-wave-a1egjco6

## Database Management

### View Data
```bash
# Open Prisma Studio (localhost:5555)
npx prisma studio

# Or use Neon Console
# https://console.neon.tech
```

### Update Schema
```bash
# After changing prisma/schema.prisma
npx prisma generate
npx prisma db push
```

### Create Migration
```bash
# For production
npx prisma migrate dev --name migration_name
```

### Reset Database (DANGER!)
```bash
npx prisma migrate reset
```

## Neon Features Available

### 1. Branching
Create separate databases for dev/staging:
```bash
npx neonctl branches create --name development
npx neonctl branches create --name staging
```

### 2. Automatic Backups
- Point-in-time recovery available
- No configuration needed
- View in Neon Console

### 3. Connection Pooling
- Already configured with PgBouncer
- Handles concurrent connections automatically
- No code changes needed

### 4. Auto-Scaling
- Compute scales based on usage
- Pay only for what you use
- No manual scaling required

### 5. Monitoring
View in Neon Console:
- Query performance
- Connection stats
- Storage usage
- Compute hours

## Performance Tips

### 1. Use Pooled Connection
Application already uses pooled connection (`-pooler` endpoint)

### 2. Connection Limits
Default limits are sufficient. If needed, adjust in Neon Console.

### 3. Query Optimization
Use Prisma Studio or Neon Console to monitor slow queries.

### 4. Indexes
Prisma schema already includes necessary indexes for foreign keys.

## Troubleshooting

### Connection Issues
```bash
# Test connection
npx prisma db pull

# View connection details
npx prisma db execute --stdin <<< "SELECT version();"
```

### Migration Issues
```bash
# Use db push for quick iterations
npx prisma db push

# Use migrations for production
npx prisma migrate dev
```

### See More Help
- [setup-neon.md](./setup-neon.md) - Detailed Neon guide
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [README.md](./README.md) - Full documentation

## Support

- Neon Docs: https://neon.tech/docs
- Neon Discord: https://discord.gg/neon
- Prisma Docs: https://prisma.io/docs

## Status Check

Run this to verify everything is working:
```bash
# 1. Check Prisma Client
npx prisma generate

# 2. Check Database Connection
npx prisma db pull

# 3. View Data
npx prisma studio

# 4. Start Application
pnpm run start:dev
```

---

🎉 **Your database is ready! Start building amazing features!** 🚀
