# StoMaTrade API Documentation

## Base URL
```
http://localhost:3000
```

## Table of Contents
1. [Users API](#users-api)
2. [Collectors API](#collectors-api)
3. [Farmers API](#farmers-api)
4. [Lands API](#lands-api)
5. [Files API](#files-api)
6. [Buyers API](#buyers-api)
7. [Buyer History API](#buyer-history-api)
8. [Projects API](#projects-api)
9. [Notifications API](#notifications-api)

---

## Users API

### Create User
**POST** `/users`

**Request Body:**
```json
{
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "role": "COLLECTOR"
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "role": "COLLECTOR",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

**Roles:** `ADMIN`, `STAFF`, `INVESTOR`, `COLLECTOR`

---

### Get All Users
**GET** `/users?page=1&limit=10`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "role": "COLLECTOR",
      "createdAt": "2025-01-27T10:30:00.000Z",
      "updatedAt": "2025-01-27T10:30:00.000Z",
      "deleted": false
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### Get User by ID
**GET** `/users/:id`

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "role": "COLLECTOR",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

---

### Update User
**PATCH** `/users/:id`

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "role": "ADMIN",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T11:00:00.000Z",
  "deleted": false
}
```

---

### Delete User (Soft Delete)
**DELETE** `/users/:id`

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "role": "COLLECTOR",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T11:30:00.000Z",
  "deleted": true
}
```

---

## Collectors API

### Create Collector
**POST** `/collectors`

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "nik": "3201234567890123",
  "name": "John Doe",
  "address": "Jl. Raya No. 123, Jakarta"
}
```

**Response:** `201 Created`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "nik": "3201234567890123",
  "name": "John Doe",
  "address": "Jl. Raya No. 123, Jakarta",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

---

### Get All Collectors
**GET** `/collectors?page=1&limit=10`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "nik": "3201234567890123",
      "name": "John Doe",
      "address": "Jl. Raya No. 123, Jakarta",
      "createdAt": "2025-01-27T10:30:00.000Z",
      "updatedAt": "2025-01-27T10:30:00.000Z",
      "deleted": false
    }
  ],
  "meta": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### Get Collector by ID
**GET** `/collectors/:id`

**Response:** `200 OK`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "nik": "3201234567890123",
  "name": "John Doe",
  "address": "Jl. Raya No. 123, Jakarta",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

---

### Update Collector
**PATCH** `/collectors/:id`

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "address": "Jl. Baru No. 456, Jakarta"
}
```

**Response:** `200 OK`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "nik": "3201234567890123",
  "name": "John Doe Updated",
  "address": "Jl. Baru No. 456, Jakarta",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T11:00:00.000Z",
  "deleted": false
}
```

---

### Delete Collector
**DELETE** `/collectors/:id`

**Response:** `200 OK`

---

## Farmers API

### Create Farmer
**POST** `/farmers`

**Request Body:**
```json
{
  "collectorId": "660e8400-e29b-41d4-a716-446655440001",
  "tokenId": 1001,
  "nik": "3201234567890124",
  "name": "Farmer Jane",
  "age": 35,
  "gender": "FEMALE",
  "address": "Desa Makmur, Kec. Subur"
}
```

**Response:** `201 Created`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "collectorId": "660e8400-e29b-41d4-a716-446655440001",
  "tokenId": 1001,
  "nik": "3201234567890124",
  "name": "Farmer Jane",
  "age": 35,
  "gender": "FEMALE",
  "address": "Desa Makmur, Kec. Subur",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

**Gender Options:** `MALE`, `FEMALE`

---

### Get All Farmers
**GET** `/farmers?page=1&limit=10`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "collectorId": "660e8400-e29b-41d4-a716-446655440001",
      "tokenId": 1001,
      "nik": "3201234567890124",
      "name": "Farmer Jane",
      "age": 35,
      "gender": "FEMALE",
      "address": "Desa Makmur, Kec. Subur",
      "createdAt": "2025-01-27T10:30:00.000Z",
      "updatedAt": "2025-01-27T10:30:00.000Z",
      "deleted": false
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

### Get Farmers by Collector
**GET** `/farmers/collector/:collectorId?page=1&limit=10`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "collectorId": "660e8400-e29b-41d4-a716-446655440001",
      "tokenId": 1001,
      "nik": "3201234567890124",
      "name": "Farmer Jane",
      "age": 35,
      "gender": "FEMALE",
      "address": "Desa Makmur, Kec. Subur",
      "createdAt": "2025-01-27T10:30:00.000Z",
      "updatedAt": "2025-01-27T10:30:00.000Z",
      "deleted": false
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### Get Farmer by ID
**GET** `/farmers/:id`

**Response:** `200 OK`

---

### Update Farmer
**PATCH** `/farmers/:id`

**Request Body:**
```json
{
  "name": "Farmer Jane Updated",
  "age": 36,
  "address": "Desa Sejahtera, Kec. Makmur"
}
```

**Response:** `200 OK`

---

### Delete Farmer
**DELETE** `/farmers/:id`

**Response:** `200 OK`

---

## Lands API

### Create Land
**POST** `/lands`

**Request Body:**
```json
{
  "farmerId": "770e8400-e29b-41d4-a716-446655440002",
  "tokenId": 2001,
  "latitude": -6.200000,
  "longitude": 106.816666,
  "address": "Plot A1, Desa Makmur"
}
```

**Response:** `201 Created`
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "farmerId": "770e8400-e29b-41d4-a716-446655440002",
  "tokenId": 2001,
  "latitude": -6.200000,
  "longitude": 106.816666,
  "address": "Plot A1, Desa Makmur",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

---

### Get All Lands
**GET** `/lands?page=1&limit=10`

**Response:** `200 OK`

---

### Get Lands by Farmer
**GET** `/lands/farmer/:farmerId?page=1&limit=10`

**Response:** `200 OK`

---

### Get Land by ID
**GET** `/lands/:id`

**Response:** `200 OK`

---

### Update Land
**PATCH** `/lands/:id`

**Request Body:**
```json
{
  "latitude": -6.201000,
  "longitude": 106.817000,
  "address": "Plot A1-Updated, Desa Makmur"
}
```

**Response:** `200 OK`

---

### Delete Land
**DELETE** `/lands/:id`

**Response:** `200 OK`

---

## Files API

### Create File
**POST** `/files`

**Request Body:**
```json
{
  "reffId": "770e8400-e29b-41d4-a716-446655440002",
  "url": "https://storage.example.com/farmers/photo.jpg",
  "type": "image/jpeg"
}
```

**Response:** `201 Created`
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "reffId": "770e8400-e29b-41d4-a716-446655440002",
  "url": "https://storage.example.com/farmers/photo.jpg",
  "type": "image/jpeg",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

---

### Get All Files
**GET** `/files?page=1&limit=10`

**Response:** `200 OK`

---

### Get Files by Reference ID
**GET** `/files/reference/:reffId?page=1&limit=10`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "reffId": "770e8400-e29b-41d4-a716-446655440002",
      "url": "https://storage.example.com/farmers/photo.jpg",
      "type": "image/jpeg",
      "createdAt": "2025-01-27T10:30:00.000Z",
      "updatedAt": "2025-01-27T10:30:00.000Z",
      "deleted": false
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### Get File by ID
**GET** `/files/:id`

**Response:** `200 OK`

---

### Delete File
**DELETE** `/files/:id`

**Response:** `200 OK`

---

## Buyers API

### Create Buyer
**POST** `/buyers`

**Request Body:**
```json
{
  "companyName": "PT Agro Makmur",
  "companyAddress": "Jl. Industri No. 789, Surabaya",
  "phoneNumber": "081234567890",
  "companyMail": "info@agromakmur.com"
}
```

**Response:** `201 Created`
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440005",
  "companyName": "PT Agro Makmur",
  "companyAddress": "Jl. Industri No. 789, Surabaya",
  "phoneNumber": "081234567890",
  "companyMail": "info@agromakmur.com",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

---

### Get All Buyers
**GET** `/buyers?page=1&limit=10`

**Response:** `200 OK`

---

### Get Buyer by ID
**GET** `/buyers/:id`

**Response:** `200 OK`

---

### Update Buyer
**PATCH** `/buyers/:id`

**Request Body:**
```json
{
  "companyName": "PT Agro Makmur Jaya",
  "phoneNumber": "081234567891"
}
```

**Response:** `200 OK`

---

### Delete Buyer
**DELETE** `/buyers/:id`

**Response:** `200 OK`

---

## Buyer History API

### Create Buyer History
**POST** `/buyers/history`

**Request Body:**
```json
{
  "buyerId": "aa0e8400-e29b-41d4-a716-446655440005",
  "buyerTransactionSuccess": 10,
  "buyerTransactionFail": 2,
  "buyerTier": "GOLD"
}
```

**Response:** `201 Created`
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440006",
  "buyerId": "aa0e8400-e29b-41d4-a716-446655440005",
  "buyerTransactionSuccess": 10,
  "buyerTransactionFail": 2,
  "buyerTier": "GOLD",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

---

### Get Buyer History by Buyer ID
**GET** `/buyers/:buyerId/history?page=1&limit=10`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440006",
      "buyerId": "aa0e8400-e29b-41d4-a716-446655440005",
      "buyerTransactionSuccess": 10,
      "buyerTransactionFail": 2,
      "buyerTier": "GOLD",
      "createdAt": "2025-01-27T10:30:00.000Z",
      "updatedAt": "2025-01-27T10:30:00.000Z",
      "deleted": false
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### Get Buyer History by ID
**GET** `/buyers/history/:id`

**Response:** `200 OK`

---

### Update Buyer History
**PATCH** `/buyers/history/:id`

**Request Body:**
```json
{
  "buyerTransactionSuccess": 11,
  "buyerTier": "PLATINUM"
}
```

**Response:** `200 OK`

---

### Delete Buyer History
**DELETE** `/buyers/history/:id`

**Response:** `200 OK`

---

## Projects API

### Create Project
**POST** `/projects`

**Request Body:**
```json
{
  "tokenId": 3001,
  "commodity": "Rice",
  "volume": 1000.5,
  "gradeQuality": "A",
  "farmerId": "770e8400-e29b-41d4-a716-446655440002",
  "landId": "880e8400-e29b-41d4-a716-446655440003",
  "sendDate": "2025-02-15T08:00:00.000Z"
}
```

**Response:** `201 Created`
```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440007",
  "tokenId": 3001,
  "commodity": "Rice",
  "volume": 1000.5,
  "gradeQuality": "A",
  "farmerId": "770e8400-e29b-41d4-a716-446655440002",
  "landId": "880e8400-e29b-41d4-a716-446655440003",
  "sendDate": "2025-02-15T08:00:00.000Z",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

---

### Get All Projects
**GET** `/projects?page=1&limit=10`

**Response:** `200 OK`

---

### Get Projects by Farmer
**GET** `/projects/farmer/:farmerId?page=1&limit=10`

**Response:** `200 OK`

---

### Get Projects by Land
**GET** `/projects/land/:landId?page=1&limit=10`

**Response:** `200 OK`

---

### Get Project by ID
**GET** `/projects/:id`

**Response:** `200 OK`

---

### Update Project
**PATCH** `/projects/:id`

**Request Body:**
```json
{
  "commodity": "Premium Rice",
  "volume": 1050.0,
  "gradeQuality": "A+",
  "sendDate": "2025-02-20T08:00:00.000Z"
}
```

**Response:** `200 OK`

---

### Delete Project
**DELETE** `/projects/:id`

**Response:** `200 OK`

---

## Notifications API

### Create Channel Notification
**POST** `/notifications/channels`

**Request Body:**
```json
{
  "key": "project_updates",
  "desc": "Channel for project-related updates"
}
```

**Response:** `201 Created`
```json
{
  "id": "dd0e8400-e29b-41d4-a716-446655440008",
  "key": "project_updates",
  "desc": "Channel for project-related updates",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

---

### Get All Channel Notifications
**GET** `/notifications/channels?page=1&limit=10`

**Response:** `200 OK`

---

### Get Channel Notification by ID
**GET** `/notifications/channels/:id`

**Response:** `200 OK`

---

### Delete Channel Notification
**DELETE** `/notifications/channels/:id`

**Response:** `200 OK`

---

### Create Notification
**POST** `/notifications`

**Request Body:**
```json
{
  "channelId": "dd0e8400-e29b-41d4-a716-446655440008",
  "title": "New Project Available",
  "body": "A new rice project has been added to your area"
}
```

**Response:** `201 Created`
```json
{
  "id": "ee0e8400-e29b-41d4-a716-446655440009",
  "channelId": "dd0e8400-e29b-41d4-a716-446655440008",
  "title": "New Project Available",
  "body": "A new rice project has been added to your area",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

---

### Get All Notifications
**GET** `/notifications?page=1&limit=10`

**Response:** `200 OK`

---

### Get Notification by ID
**GET** `/notifications/:id`

**Response:** `200 OK`

---

### Delete Notification
**DELETE** `/notifications/:id`

**Response:** `200 OK`

---

### Create Token Notification
**POST** `/notifications/tokens`

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "tokenId": "fcm_token_abc123xyz"
}
```

**Response:** `201 Created`
```json
{
  "id": "ff0e8400-e29b-41d4-a716-446655440010",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "tokenId": "fcm_token_abc123xyz",
  "createdAt": "2025-01-27T10:30:00.000Z",
  "updatedAt": "2025-01-27T10:30:00.000Z",
  "deleted": false
}
```

---

### Get Token Notifications by User
**GET** `/notifications/tokens/user/:userId?page=1&limit=10`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "ff0e8400-e29b-41d4-a716-446655440010",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "tokenId": "fcm_token_abc123xyz",
      "createdAt": "2025-01-27T10:30:00.000Z",
      "updatedAt": "2025-01-27T10:30:00.000Z",
      "deleted": false
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### Delete Token Notification
**DELETE** `/notifications/tokens/:id`

**Response:** `200 OK`

---

## Common Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "walletAddress should not be empty",
    "role must be one of the following values: ADMIN, STAFF, INVESTOR, COLLECTOR"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Notes

1. All endpoints support pagination with `page` and `limit` query parameters
2. All DELETE operations are soft deletes (set `deleted: true`)
3. All timestamps are in ISO 8601 format (UTC)
4. UUIDs are used for all entity IDs
5. Validation is enabled globally - invalid requests will return 400 with detailed error messages
