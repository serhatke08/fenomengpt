# Backend - Social Media Panel

Bu backend Node.js, Express, TypeScript ve Firebase Firestore veritabanı ile geliştirilmiştir.

## Özellikler

- **Kimlik Doğrulama**: Kullanıcı kaydı, giriş, profil yönetimi
- **Hizmetler**: Sosyal medya hizmetleri yönetimi (Instagram, TikTok, YouTube, Twitter)
- **Siparişler**: Sipariş oluşturma, takip ve yönetim
- **Admin Paneli**: Kullanıcı yönetimi, hizmet yönetimi, sipariş yönetimi, istatistikler
- **Güvenlik**: JWT kimlik doğrulama, rate limiting, CORS koruması

## Teknoloji Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Dil**: TypeScript
- **Veritabanı**: Firebase Firestore
- **Kimlik Doğrulama**: JWT + Firebase Admin SDK
- **Güvenlik**: Helmet, CORS, Rate Limiting

## Kurulum

1. **Dependencies yükle**:
   ```bash
   npm install
   ```

2. **Firebase Kurulumu**:
   Detaylı kurulum için `FIREBASE_SETUP.md` dosyasını takip et.

3. **Environment Configuration**:
   `backend` klasöründe `.env` dosyası oluştur ve Firebase bilgilerini ekle.

4. **Build ve Çalıştır**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## Hızlı Başlangıç

1. Firebase projesi oluştur
2. Service account key indir
3. `.env` dosyası oluştur ve bilgileri ekle
4. Firestore veritabanını etkinleştir
5. `npm run test-firebase` ile test et
6. `npm run dev` ile çalıştır
7. `npm run seed` ile başlangıç verilerini yükle

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Services
- `GET /api/services` - Get all active services
- `GET /api/services/:id` - Get service by ID

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/cancel` - Cancel order

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/services` - Get all services
- `POST /api/admin/services` - Create service
- `PUT /api/admin/services/:id` - Update service
- `DELETE /api/admin/services/:id` - Delete service
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id` - Update order
- `GET /api/admin/stats` - Get statistics

## Testing Firebase Connection

```bash
# Build first
npm run build

# Test Firebase connection
node test-firebase.js
```

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project_id.iam.gserviceaccount.com

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```
