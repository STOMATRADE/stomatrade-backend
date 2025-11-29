# 🔐 Authentication & Authorization Implementation Summary

## ✅ What Has Been Implemented

Sistem authentication dan authorization telah **sepenuhnya dikonfigurasi dan siap digunakan** untuk StoMaTrade Backend V2.

---

## 📦 Components Overview

### 1. **Authentication Module** (`src/modules/auth/`)

Sudah tersedia lengkap dengan:

| Component | File | Purpose |
|-----------|------|---------|
| **Service** | `auth.service.ts` | Wallet signature verification, JWT generation |
| **Controller** | `auth.controller.ts` | Auth endpoints (nonce, verify, register, profile, refresh) |
| **JWT Strategy** | `strategies/jwt.strategy.ts` | Passport JWT validation |
| **JWT Guard** | `guards/jwt-auth.guard.ts` | JWT token verification |
| **Roles Guard** | `guards/roles.guard.ts` | Role-based access control |
| **Wallet Guard** | `guards/wallet-auth.guard.ts` | Wallet ownership verification |
| **@Public()** | `decorators/public.decorator.ts` | Mark endpoints as public |
| **@Roles()** | `decorators/roles.decorator.ts` | Require specific roles |
| **@CurrentUser()** | `decorators/current-user.decorator.ts` | Get authenticated user |

---

## 🛠️ Configuration Changes Made

### 1. **Global Guards Activated** (`src/app.module.ts`)

```typescript
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,  // ✅ GLOBAL JWT GUARD
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,     // ✅ GLOBAL ROLE GUARD
    },
  ],
})
export class AppModule {}
```

**Dampak:**
- ✅ Semua endpoint **secara default** memerlukan JWT authentication
- ✅ Gunakan `@Public()` untuk endpoint yang tidak perlu auth
- ✅ Gunakan `@Roles()` untuk membatasi akses per role

---

### 2. **Environment Configuration** (`.env.example`)

Ditambahkan konfigurasi JWT:

```bash
# JWT Authentication Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
```

**Action Required:**
- Copy dari `.env.example` ke `.env`
- Generate secure JWT_SECRET:
  ```bash
  openssl rand -base64 32
  ```

---

### 3. **Public Endpoints Configured**

#### AppController (`src/app.controller.ts`)
```typescript
@Public()
@Get()
getHello() {
  return this.appService.getHello();
}
```

#### AuthController (`src/modules/auth/auth.controller.ts`)
```typescript
@Public()
@Post('nonce')
requestNonce() { ... }

@Public()
@Post('verify')
verifySignature() { ... }

// Protected (requires Admin role)
@Roles(ROLES.ADMIN)
@Post('register')
registerUser() { ... }

// Protected (requires JWT)
@Get('profile')
getProfile() { ... }
```

---

### 4. **Example Protected Controllers**

#### UsersController (`src/modules/users/users.controller.ts`)

```typescript
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {

  @Roles(ROLES.ADMIN)
  @Post()
  create() { ... }  // ✅ Admin only

  @Roles(ROLES.ADMIN, ROLES.STAFF)
  @Get()
  findAll() { ... }  // ✅ Admin or Staff

  @Get(':id')
  findOne() { ... }  // ✅ All authenticated users

  @Roles(ROLES.ADMIN)
  @Patch(':id')
  update() { ... }  // ✅ Admin only

  @Roles(ROLES.ADMIN)
  @Delete(':id')
  remove() { ... }  // ✅ Admin only
}
```

#### ProjectsController (`src/modules/projects/projects.controller.ts`)

```typescript
@ApiBearerAuth('JWT-auth')
@Controller('projects')
export class ProjectsController {

  @Public()
  @Get()
  findAll() { ... }  // ✅ Public

  @Public()
  @Get(':id')
  findOne() { ... }  // ✅ Public

  @Roles(ROLES.ADMIN, ROLES.STAFF, ROLES.COLLECTOR)
  @Post()
  create() { ... }  // ✅ Admin/Staff/Collector

  @Roles(ROLES.ADMIN, ROLES.STAFF)
  @Patch(':id')
  update() { ... }  // ✅ Admin/Staff

  @Roles(ROLES.ADMIN)
  @Delete(':id')
  remove() { ... }  // ✅ Admin only
}
```

---

## 🎯 Available Roles

```typescript
enum ROLES {
  ADMIN       // Full system access
  STAFF       // Operational access
  INVESTOR    // Investment access
  COLLECTOR   // Farmer/Project management
}
```

---

## 🔑 Authentication Flow

### Client Login Steps:

1. **Generate message with timestamp:**
   ```javascript
   const message = `Login StoMaTrade: ${new Date().toISOString()}`;
   ```

2. **Sign with wallet:**
   ```javascript
   const signature = await signer.signMessage(message);
   ```

3. **Send to backend:**
   ```bash
   POST /auth/verify
   {
     "walletAddress": "0x...",
     "message": "Login StoMaTrade: 2025-11-29T10:00:00.000Z",
     "signature": "0x..."
   }
   ```

4. **Receive JWT token:**
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "uuid",
       "walletAddress": "0x...",
       "role": "INVESTOR"
     }
   }
   ```

5. **Use token in requests:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 📝 How to Apply Guards to Controllers

### Step 1: Import Decorators

```typescript
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ROLES } from '@prisma/client';
```

### Step 2: Add @ApiBearerAuth to Controller

```typescript
@ApiBearerAuth('JWT-auth')
@Controller('resource')
export class ResourceController {
  // ...
}
```

### Step 3: Configure Endpoints

**For public endpoints:**
```typescript
@Public()
@Get()
findAll() {
  // No authentication required
}
```

**For authenticated endpoints (all roles):**
```typescript
@Get('my-data')
getMyData(@CurrentUser('sub') userId: string) {
  // Requires JWT, any role
}
```

**For role-restricted endpoints:**
```typescript
@Roles(ROLES.ADMIN, ROLES.STAFF)
@Post()
create() {
  // Only Admin or Staff
}
```

### Step 4: Add Swagger Responses

```typescript
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Authentication required',
})
@ApiResponse({
  status: HttpStatus.FORBIDDEN,
  description: 'Insufficient permissions',
})
```

---

## 🚀 Quick Start Guide

### 1. **Setup Environment**

```bash
# Copy example
cp .env.example .env

# Edit .env and add:
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRES_IN=7d
```

### 2. **Install Dependencies** (already installed)

```bash
pnpm install
# or
npm install
```

Dependencies sudah include:
- `@nestjs/jwt`
- `@nestjs/passport`
- `passport`
- `passport-jwt`

### 3. **Run Application**

```bash
pnpm run start:dev
```

### 4. **Test Authentication in Swagger**

1. Buka `http://localhost:3000/api`
2. Test endpoint `POST /auth/verify` dengan wallet signature
3. Copy `accessToken` dari response
4. Click tombol **"Authorize"** di Swagger UI
5. Paste token dan click "Authorize"
6. Sekarang semua protected endpoints bisa diakses!

---

## 📊 Current Status of Controllers

| Controller | Auth Status | Role Protection | Notes |
|-----------|-------------|-----------------|-------|
| **AppController** | ✅ @Public() | N/A | Health check |
| **AuthController** | ✅ Mixed | Admin for register | Login endpoints public |
| **UsersController** | ✅ Protected | Admin/Staff | Example implemented |
| **ProjectsController** | ✅ Mixed | Role-based | Public read, protected write |
| **CollectorsController** | ⚠️ **Needs guards** | TBD | Apply guards as needed |
| **FarmersController** | ⚠️ **Needs guards** | TBD | Apply guards as needed |
| **LandsController** | ⚠️ **Needs guards** | TBD | Apply guards as needed |
| **FilesController** | ⚠️ **Needs guards** | TBD | Apply guards as needed |
| **BuyersController** | ⚠️ **Needs guards** | TBD | Apply guards as needed |
| **InvestmentsController** | ⚠️ **Needs guards** | Investor required | Apply guards as needed |
| **PortfoliosController** | ⚠️ **Needs guards** | Owner/Admin | Apply guards as needed |
| **ProfitsController** | ⚠️ **Needs guards** | Admin for deposit | Apply guards as needed |
| **FarmerSubmissionsController** | ⚠️ **Needs guards** | Collector/Admin | Apply guards as needed |
| **ProjectSubmissionsController** | ⚠️ **Needs guards** | Staff/Admin | Apply guards as needed |
| **RefundsController** | ⚠️ **Needs guards** | Admin | Apply guards as needed |
| **NotificationsController** | ⚠️ **Needs guards** | TBD | Apply guards as needed |

**Legend:**
- ✅ Guards applied
- ⚠️ Needs implementation (gunakan contoh dari UsersController atau ProjectsController)

---

## 🎯 Recommended Next Steps

### 1. **Apply Guards to Remaining Controllers**

Gunakan pattern dari `UsersController` dan `ProjectsController` sebagai template:

```typescript
// Template untuk controller
@ApiBearerAuth('JWT-auth')
@Controller('resource')
export class ResourceController {

  @Public()  // If endpoint is public
  @Get()
  findAll() { ... }

  @Roles(ROLES.ADMIN, ROLES.STAFF)  // Role restriction
  @Post()
  create() { ... }

  // All authenticated users (no role restriction)
  @Get('my-data')
  getMyData(@CurrentUser('sub') userId: string) { ... }
}
```

### 2. **Define Access Policies**

Tentukan access policy untuk setiap module:

**Example for Investments:**
```typescript
@ApiBearerAuth('JWT-auth')
@Controller('investments')
export class InvestmentsController {

  // Investor can create investment
  @Roles(ROLES.INVESTOR)
  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: any) { ... }

  // User can see their own investments
  @Get('my-investments')
  getMyInvestments(@CurrentUser('sub') userId: string) { ... }

  // Admin can see all investments
  @Roles(ROLES.ADMIN)
  @Get()
  findAll() { ... }
}
```

### 3. **Test All Endpoints**

- Test public endpoints (tidak perlu auth)
- Test protected endpoints (perlu JWT)
- Test role-restricted endpoints (perlu role tertentu)
- Test error cases (invalid token, insufficient permissions)

---

## 📚 Documentation

Dokumentasi lengkap tersedia di:

- **[AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)** - Complete authentication & authorization guide
  - Authentication flow
  - Guards & decorators usage
  - Implementation examples
  - Frontend integration
  - Troubleshooting

---

## 🔒 Security Features

✅ **Wallet-based authentication** (MetaMask, WalletConnect, etc)
✅ **JWT token with configurable expiry**
✅ **Signature verification** using ethers.js
✅ **Smart Wallet support** (EIP-1271)
✅ **Role-based access control** (RBAC)
✅ **Wallet ownership verification**
✅ **Auto-user creation** on first login
✅ **Global guards** applied to all endpoints
✅ **Signature expiry** (60 seconds)
✅ **Token refresh** endpoint

---

## ⚠️ Important Notes

1. **JWT_SECRET harus di-set di .env** sebelum production
2. **Generate secure secret** menggunakan `openssl rand -base64 32`
3. **Semua endpoint default protected** - gunakan `@Public()` untuk public endpoints
4. **Guards berjalan in order** - JwtAuthGuard → RolesGuard
5. **Admin bypass wallet ownership check** di WalletAuthGuard

---

## 🐛 Common Issues & Solutions

### Issue: "Authentication required" on public endpoint
**Solution:** Tambahkan `@Public()` decorator

### Issue: "Access denied" meskipun sudah login
**Solution:** Check role dengan `GET /auth/profile`, pastikan role sesuai dengan `@Roles()`

### Issue: Guards tidak bekerja
**Solution:** Pastikan global guards sudah di-register di `app.module.ts`

---

## 📞 Support

Jika ada pertanyaan atau issues:
1. Baca [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)
2. Check [APP_NOTES.md](./APP_NOTES.md) untuk context aplikasi
3. Review implementation di `UsersController` atau `ProjectsController`

---

**Implementation Date:** November 29, 2025
**Status:** ✅ Complete and Ready to Use
**Version:** 1.2.0
