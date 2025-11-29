# 🚀 Auth Guards Quick Reference

## 📋 Cheat Sheet

### Import Statements

```typescript
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { WalletAuthGuard } from '../auth/guards/wallet-auth.guard';
import { ROLES } from '@prisma/client';
```

---

## 🎯 Controller Configuration

### Basic Setup

```typescript
@ApiTags('YourModule')
@ApiBearerAuth('JWT-auth')  // Enable auth in Swagger
@Controller('your-module')
export class YourController {
  // ...
}
```

---

## 🔓 Endpoint Access Patterns

### 1. Public (No Auth Required)

```typescript
@Public()
@Get()
findAll() {
  return this.service.findAll();
}
```

**Use Cases:**
- Health checks
- Public project listings
- Public documentation

---

### 2. Authenticated (Any Role)

```typescript
@Get('my-data')
getMyData(@CurrentUser('sub') userId: string) {
  return this.service.findByUser(userId);
}
```

**Use Cases:**
- User profile
- My investments
- My portfolio

---

### 3. Role-Based Access

#### Single Role

```typescript
@Roles(ROLES.ADMIN)
@Delete(':id')
remove(@Param('id') id: string) {
  return this.service.remove(id);
}
```

#### Multiple Roles

```typescript
@Roles(ROLES.ADMIN, ROLES.STAFF)
@Patch(':id')
update(@Param('id') id: string, @Body() dto: UpdateDto) {
  return this.service.update(id, dto);
}
```

**Common Patterns:**
- `@Roles(ROLES.ADMIN)` - Admin only
- `@Roles(ROLES.ADMIN, ROLES.STAFF)` - Admin or Staff
- `@Roles(ROLES.COLLECTOR, ROLES.STAFF, ROLES.ADMIN)` - Collector, Staff, or Admin
- `@Roles(ROLES.INVESTOR)` - Investor only

---

### 4. Wallet Ownership

```typescript
@UseGuards(WalletAuthGuard)
@Post('submit')
submit(
  @CurrentUser('walletAddress') userWallet: string,
  @Body() dto: { walletAddress: string, data: any }
) {
  // Ensures dto.walletAddress === userWallet (unless Admin)
  return this.service.submit(dto);
}
```

**Use Cases:**
- Submit farmer for minting (must own wallet)
- Create investment (must own wallet)

---

## 👤 Current User Decorator

### Get User ID

```typescript
@Get('my-profile')
getProfile(@CurrentUser('sub') userId: string) {
  return this.service.findOne(userId);
}
```

### Get Wallet Address

```typescript
@Get('my-wallet')
getWallet(@CurrentUser('walletAddress') wallet: string) {
  return { wallet };
}
```

### Get Role

```typescript
@Get('my-role')
getRole(@CurrentUser('role') role: string) {
  return { role };
}
```

### Get Full User Object

```typescript
@Get('me')
getMe(@CurrentUser() user: JwtPayload) {
  // user = { sub, walletAddress, role }
  return user;
}
```

---

## 📊 Swagger Responses

### Standard Auth Responses

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

### Complete Example

```typescript
@Roles(ROLES.ADMIN)
@Post()
@ApiOperation({ summary: 'Create resource (Admin only)' })
@ApiResponse({
  status: HttpStatus.CREATED,
  description: 'Resource created successfully',
  type: ResourceDto,
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Authentication required',
})
@ApiResponse({
  status: HttpStatus.FORBIDDEN,
  description: 'Admin access required',
})
create(@Body() dto: CreateDto) {
  return this.service.create(dto);
}
```

---

## 🎨 Common Patterns

### Pattern 1: CRUD with Role-Based Access

```typescript
@ApiBearerAuth('JWT-auth')
@Controller('resources')
export class ResourcesController {

  @Public()
  @Get()
  findAll() { /* Public */ }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) { /* Public */ }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Post()
  create(@Body() dto: CreateDto) { /* Staff/Admin only */ }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDto) { /* Staff/Admin only */ }

  @Roles(ROLES.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) { /* Admin only */ }
}
```

---

### Pattern 2: User-Owned Resources

```typescript
@ApiBearerAuth('JWT-auth')
@Controller('investments')
export class InvestmentsController {

  // User can see their own investments
  @Get('mine')
  findMine(@CurrentUser('sub') userId: string) {
    return this.service.findByUser(userId);
  }

  // User can create investment
  @Roles(ROLES.INVESTOR)
  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateInvestmentDto
  ) {
    return this.service.create(userId, dto);
  }

  // Admin can see all investments
  @Roles(ROLES.ADMIN)
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
```

---

### Pattern 3: Hierarchical Access

```typescript
@ApiBearerAuth('JWT-auth')
@Controller('submissions')
export class SubmissionsController {

  // All authenticated users can view
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // Collectors can submit
  @Roles(ROLES.COLLECTOR, ROLES.STAFF, ROLES.ADMIN)
  @Post()
  create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }

  // Only Admin can approve
  @Roles(ROLES.ADMIN)
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  // Only Admin can reject
  @Roles(ROLES.ADMIN)
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectDto) {
    return this.service.reject(id, dto);
  }
}
```

---

## 🔐 Available Roles

```typescript
ROLES.ADMIN      // Full system access
ROLES.STAFF      // Operational access
ROLES.COLLECTOR  // Farmer/Project management
ROLES.INVESTOR   // Investment access
```

---

## ⚡ Quick Commands

### Test Login in Terminal

```bash
# Step 1: Request nonce (optional)
curl -X POST http://localhost:3000/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x..."}'

# Step 2: Login with signature
curl -X POST http://localhost:3000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x...",
    "message": "Login StoMaTrade: 2025-11-29T10:00:00.000Z",
    "signature": "0x..."
  }'

# Step 3: Use token
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📝 Checklist untuk Setiap Controller

- [ ] Import decorators yang diperlukan
- [ ] Tambahkan `@ApiBearerAuth('JWT-auth')` di controller
- [ ] Tentukan endpoint mana yang public (`@Public()`)
- [ ] Tentukan endpoint mana yang perlu role tertentu (`@Roles()`)
- [ ] Gunakan `@CurrentUser()` untuk get authenticated user
- [ ] Tambahkan Swagger responses untuk 401 dan 403
- [ ] Update operation summary jika ada role restriction

---

## 🚨 Common Mistakes

### ❌ Wrong

```typescript
// Forgot @Public() on public endpoint
@Get()
findAll() { ... }
// Will return 401 Unauthorized!

// Forgot @Roles() on admin endpoint
@Delete(':id')
remove() { ... }
// Any authenticated user can delete!

// Typo in role name
@Roles('ADMINN')  // Wrong!
```

### ✅ Correct

```typescript
@Public()
@Get()
findAll() { ... }

@Roles(ROLES.ADMIN)
@Delete(':id')
remove() { ... }

@Roles(ROLES.ADMIN)  // Use enum!
```

---

## 🎯 Decision Tree

```
Is endpoint public?
├─ Yes → Use @Public()
└─ No → Needs authentication
    ├─ Any authenticated user can access?
    │   └─ Yes → No decorator needed, use @CurrentUser()
    └─ Specific role required?
        └─ Yes → Use @Roles(ROLES.X)
            ├─ Check wallet ownership?
            │   └─ Yes → Add @UseGuards(WalletAuthGuard)
            └─ Done!
```

---

## 💡 Tips

1. **Default behavior**: All endpoints require authentication
2. **@Public() first**: Place `@Public()` before other decorators
3. **Multiple roles**: Separate with comma `@Roles(ROLES.A, ROLES.B)`
4. **Admin bypass**: Admin can bypass WalletAuthGuard
5. **CurrentUser**: Always available in protected endpoints

---

## 📱 Frontend Example

```typescript
// Login
const { accessToken } = await fetch('/auth/verify', {
  method: 'POST',
  body: JSON.stringify({ walletAddress, message, signature })
}).then(r => r.json());

// Save token
localStorage.setItem('token', accessToken);

// Use in requests
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

---

**Last Updated:** November 29, 2025
