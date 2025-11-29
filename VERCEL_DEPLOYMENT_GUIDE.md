# Vercel Deployment Guide - StoMaTrade Backend V2

## Overview

Backend NestJS StoMaTrade V2 telah dikonfigurasi untuk deployment di Vercel dengan serverless functions. Semua konfigurasi sudah siap dan tidak ada code yang rusak (17/17 test suites passed).

---

## Files Created/Modified

### 1. **vercel.json** (NEW)
Konfigurasi utama untuk Vercel deployment:
- Build command: `pnpm run build`
- Routes: semua request diarahkan ke `dist/main.js`
- Region: Singapore (sin1)

### 2. **api/index.ts** (NEW)
Serverless entry point untuk Vercel:
- Menggunakan `@nestjs/platform-express`
- CORS enabled
- Global prefix: `/api`

### 3. **package.json** (MODIFIED)
Menambahkan script baru:
```json
"vercel-build": "prisma generate && prisma migrate deploy && nest build"
```

### 4. **.vercelignore** (NEW)
Files yang di-ignore saat deployment:
- node_modules
- test files
- environment files (.env)
- coverage reports

---

## Environment Variables di Vercel

Sebelum deploy, set environment variables berikut di Vercel Dashboard:

### Database
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### JWT Authentication
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
```

### Blockchain Configuration
```
BLOCKCHAIN_RPC_URL=https://rpc.sepolia-api.lisk.com
BLOCKCHAIN_CHAIN_ID=4202
PLATFORM_WALLET_PRIVATE_KEY=your-private-key-here
STOMA_TRADE_ADDRESS=your-contract-address
```

### Firebase (Optional - for notifications)
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### IPFS (Optional - for file storage)
```
IPFS_PINATA_JWT=your-pinata-jwt
```

---

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push code ke GitHub**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin master
   ```

2. **Import di Vercel Dashboard**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Set environment variables
   - Deploy

---

## Database Migration

Vercel akan otomatis menjalankan migration saat build dengan script `vercel-build`:

```bash
prisma generate && prisma migrate deploy && nest build
```

**PENTING:** Pastikan `DATABASE_URL` sudah di-set di environment variables Vercel sebelum deploy.

---

## Testing Deployment

### 1. Check Health Endpoint
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-29T..."
}
```

### 2. Test Authentication
```bash
# Request nonce
curl -X POST https://your-app.vercel.app/api/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44E"}'

# Verify signature (after signing)
curl -X POST https://your-app.vercel.app/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44E",
    "message": "...",
    "signature": "..."
  }'
```

### 3. Test Swagger Documentation
Open browser: `https://your-app.vercel.app/api`

---

## Important Notes

### ✅ Tests Status
```
Test Suites: 17 passed, 17 total
Tests:       158 passed, 158 total
```

**Semua tests PASS** - tidak ada code yang rusak setelah konfigurasi Vercel.

### ✅ Code Impact
- **TIDAK ADA** perubahan pada business logic
- **TIDAK ADA** perubahan pada controllers, services, atau modules
- **HANYA** menambahkan konfigurasi deployment
- Semua fitur tetap berfungsi normal

### ⚠️ Serverless Limitations

1. **Cold Start**: First request mungkin lambat (3-5 seconds)
2. **Timeout**: Maximum 10 seconds per request (Vercel Hobby plan)
3. **Database Connections**: Use connection pooling (PgBouncer recommended)
4. **File Uploads**: Max 4.5MB per request

---

## Production Checklist

- [ ] Set all environment variables di Vercel
- [ ] Configure production DATABASE_URL (with connection pooling)
- [ ] Generate secure JWT_SECRET (min 32 characters)
- [ ] Set PLATFORM_WALLET_PRIVATE_KEY dengan private key yang aman
- [ ] Verify STOMA_TRADE_ADDRESS contract address
- [ ] Test semua endpoints setelah deployment
- [ ] Enable Vercel Analytics (optional)
- [ ] Setup custom domain (optional)
- [ ] Configure CORS untuk production domain
- [ ] Setup monitoring/logging (Sentry, LogRocket, etc.)

---

## Rollback Strategy

Jika terjadi issue saat deployment:

1. **Via Vercel Dashboard**
   - Go to Deployments
   - Select previous working deployment
   - Click "Promote to Production"

2. **Via CLI**
   ```bash
   vercel rollback
   ```

---

## Performance Optimization

### 1. Database Connection Pooling
Gunakan PgBouncer atau Prisma Data Proxy untuk connection pooling:

```env
DATABASE_URL=postgresql://user:password@pgbouncer-host:6432/dbname?pgbouncer=true
```

### 2. Prisma Configuration
Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```

### 3. Cache Strategy
Consider implementing Redis for caching (optional):
```bash
npm install @nestjs/cache-manager cache-manager
```

---

## Monitoring & Logs

### View Logs
```bash
vercel logs
```

### Real-time Logs
```bash
vercel logs --follow
```

### Filter by Function
```bash
vercel logs --output dist/main.js
```

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate generation (automatic)

---

## Support & Troubleshooting

### Common Issues

**Issue 1: Database connection timeout**
- Solution: Use connection pooling (PgBouncer)
- Increase connection limit di Prisma schema

**Issue 2: Cold start too slow**
- Solution: Consider Vercel Pro plan atau keep-alive strategy
- Optimize bundle size dengan tree-shaking

**Issue 3: Environment variables tidak terbaca**
- Solution: Restart deployment setelah set env vars
- Verify case-sensitive variable names

**Issue 4: Prisma migration fails**
- Solution: Run migration manual via `prisma migrate deploy`
- Check DATABASE_URL format

---

## Next Steps After Deployment

1. **Setup Monitoring**
   - Vercel Analytics
   - Custom APM (Sentry, New Relic)
   - Uptime monitoring (Uptime Robot)

2. **Security Hardening**
   - Rate limiting (middleware)
   - CORS configuration
   - Helmet.js for security headers

3. **Performance Tuning**
   - Database indexing
   - Query optimization
   - Caching strategy

4. **Documentation**
   - Update API documentation
   - Share Swagger URL with team
   - Document deployment process

---

**Deployment Ready:** ✅
**Tests Status:** 17/17 PASSED
**Code Impact:** ZERO BREAKING CHANGES
**Version:** 1.4.0 (Vercel Ready)

---

## Quick Deploy Command

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy to production
vercel --prod

# Done! Your app is live! 🚀
```
