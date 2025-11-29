# Swagger API Documentation Guide

## Mengakses Swagger UI

Setelah aplikasi berjalan, buka browser dan kunjungi:

```
http://localhost:3000/api
```

## Fitur Swagger UI

### 1. Interactive API Testing
- Klik endpoint yang ingin di-test
- Klik tombol "Try it out"
- Isi request body/parameters
- Klik "Execute"
- Lihat response langsung

### 2. Schemas
- Scroll ke bawah untuk melihat semua schemas/DTOs
- Klik schema untuk melihat detail struktur data
- Contoh values otomatis ditampilkan

### 3. Tags
API dikelompokkan berdasarkan tags:
- **users** - User management
- **collectors** - Collector management
- **farmers** - Farmer management
- **lands** - Land management
- **files** - File management
- **buyers** - Buyer & Buyer History management
- **projects** - Project management
- **notifications** - Notification management

## Contoh Penggunaan

### 1. Create User
1. Buka tag "users"
2. Klik "POST /users"
3. Klik "Try it out"
4. Edit request body:
```json
{
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "role": "COLLECTOR"
}
```
5. Klik "Execute"
6. Lihat response dengan ID yang ter-generate

### 2. Get All Users dengan Pagination
1. Buka "GET /users"
2. Klik "Try it out"
3. Isi parameter (optional):
   - page: 1
   - limit: 10
4. Klik "Execute"
5. Lihat paginated response

### 3. Get User by ID
1. Copy ID dari response sebelumnya
2. Buka "GET /users/{id}"
3. Klik "Try it out"
4. Paste ID ke parameter
5. Klik "Execute"

### 4. Update User
1. Buka "PATCH /users/{id}"
2. Klik "Try it out"
3. Isi ID dan request body:
```json
{
  "role": "ADMIN"
}
```
4. Klik "Execute"

### 5. Delete User (Soft Delete)
1. Buka "DELETE /users/{id}"
2. Klik "Try it out"
3. Isi ID
4. Klik "Execute"
5. Data di-mark sebagai deleted=true

## Tips

### Menggunakan Pagination
Semua list endpoints mendukung pagination:
- `page`: Halaman yang ingin ditampilkan (default: 1)
- `limit`: Jumlah item per halaman (default: 10)

Contoh: `GET /farmers?page=2&limit=20`

### Enum Values
Swagger akan menampilkan dropdown untuk enum fields:
- **ROLES**: ADMIN, STAFF, INVESTOR, COLLECTOR
- **GENDER**: MALE, FEMALE

### UUID Format
Semua ID menggunakan format UUID v4:
```
550e8400-e29b-41d4-a716-446655440000
```

### Date Format
Gunakan ISO 8601 format untuk dates:
```
2025-01-27T10:30:00.000Z
```

## Testing Flow Example

### Membuat Project Lengkap

1. **Create User (Collector)**
```bash
POST /users
{
  "walletAddress": "0xABC...",
  "role": "COLLECTOR"
}
```
Save `userId`

2. **Create Collector**
```bash
POST /collectors
{
  "userId": "<userId dari step 1>",
  "nik": "3201234567890123",
  "name": "John Collector",
  "address": "Jl. Raya No. 1"
}
```
Save `collectorId`

3. **Create Farmer**
```bash
POST /farmers
{
  "collectorId": "<collectorId dari step 2>",
  "tokenId": 1001,
  "nik": "3201234567890124",
  "name": "Farmer Jane",
  "age": 35,
  "gender": "FEMALE",
  "address": "Desa Makmur"
}
```
Save `farmerId`

4. **Create Land**
```bash
POST /lands
{
  "farmerId": "<farmerId dari step 3>",
  "tokenId": 2001,
  "latitude": -6.200000,
  "longitude": 106.816666,
  "address": "Plot A1"
}
```
Save `landId`

5. **Create Project**
```bash
POST /projects
{
  "tokenId": 3001,
  "commodity": "Rice",
  "volume": 1000.5,
  "gradeQuality": "A",
  "farmerId": "<farmerId dari step 3>",
  "landId": "<landId dari step 4>",
  "sendDate": "2025-02-15T08:00:00.000Z"
}
```

6. **Verify with GET requests**
```bash
GET /farmers/collector/{collectorId}
GET /lands/farmer/{farmerId}
GET /projects/farmer/{farmerId}
```

## Error Responses

Swagger juga menampilkan contoh error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "walletAddress should not be empty"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User with ID xxx not found",
  "error": "Not Found"
}
```

## Keuntungan Menggunakan Swagger

1. **No Need for Postman** - Test langsung di browser
2. **Auto Documentation** - Selalu up-to-date dengan code
3. **Type Safety** - Validation otomatis
4. **Easy Sharing** - Share URL ke team
5. **Request Examples** - Contoh request otomatis
6. **Schema Validation** - Cek struktur data dengan mudah

## Export OpenAPI Spec

Untuk mendapatkan OpenAPI JSON spec:
```
http://localhost:3000/api-json
```

Untuk YAML format:
```
http://localhost:3000/api-yaml
```

## Troubleshooting

### Swagger tidak muncul
- Pastikan aplikasi sudah running
- Cek console untuk error
- Pastikan mengakses `http://localhost:3000/api` bukan `/swagger`

### Validation error saat testing
- Cek required fields
- Cek format data (string, number, enum)
- Cek example values di schema

### Cannot find module error
- Run `pnpm install`
- Run `npx prisma generate`
- Restart aplikasi

## Support

Jika ada pertanyaan atau issue, silakan:
1. Cek dokumentasi ini
2. Cek [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Cek [README.md](./README.md)
4. Create issue di repository
