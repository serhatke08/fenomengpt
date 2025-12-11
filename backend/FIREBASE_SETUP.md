# Firebase Kurulum Rehberi

## ⚠️ ÖNEMLİ: Bu adımları sırayla takip et!

## 1. Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com/)'a git
2. "Create a project" butonuna tıkla
3. Proje adını gir (örn: `social-media-panel`)
4. Google Analytics'i etkinleştir (isteğe bağlı)
5. "Create project" butonuna tıkla

## 2. Service Account Key Oluştur

1. Firebase Console'da projeni seç
2. Sol menüden "Project settings" (⚙️) tıkla
3. "Service accounts" sekmesine git
4. "Generate new private key" butonuna tıkla
5. JSON dosyasını indir ve güvenli bir yerde sakla

## 3. Environment Variables Ayarla

**ÖNEMLİ**: `backend` klasöründe `.env` dosyası oluştur ve şu bilgileri ekle:

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

## 4. Firebase Bilgilerini Bul

İndirdiğin JSON dosyasından şu bilgileri al:

- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY`
- `client_email` → `FIREBASE_CLIENT_EMAIL`

**ÖRNEK**:
```env
FIREBASE_PROJECT_ID=social-media-panel-12345
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@social-media-panel-12345.iam.gserviceaccount.com
```

## 5. Firestore Veritabanını Etkinleştir

1. Firebase Console'da projeni seç
2. Sol menüden "Firestore Database" tıkla
3. "Create database" butonuna tıkla
4. "Start in test mode" seç (geliştirme için)
5. "Next" ve "Done" butonlarına tıkla

## 6. Backend'i Çalıştır

```bash
# Dependencies yükle
npm install

# Build et
npm run build

# Firebase bağlantısını test et
npm run test-firebase

# Development modunda çalıştır
npm run dev

# Veya production modunda çalıştır
npm start
```

## 7. Başlangıç Verilerini Yükle

```bash
# Örnek servisler ve admin kullanıcısı oluştur
npm run seed
```

## 8. API Endpoints Test Et

```bash
# Health check
curl http://localhost:5000/api/health

# Services listesi
curl http://localhost:5000/api/services

# Admin kullanıcısı ile giriş yap
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@panel.com","password":"admin123"}'
```

## 9. Frontend'i Bağla

Frontend'de `lib/firebase.ts` dosyasını güncelle:

```typescript
const firebaseConfig = {
  apiKey: "your_firebase_api_key",
  authDomain: "your_project_id.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project_id.appspot.com",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id"
};
```

## Sorun Giderme

### Firebase bağlantı hatası
- `.env` dosyasındaki bilgileri kontrol et
- Service account key'in doğru olduğundan emin ol
- Firestore veritabanının etkinleştirildiğini kontrol et

### Port hatası
- `.env` dosyasında `PORT=5000` olduğundan emin ol
- 5000 portunun kullanılmadığını kontrol et

### CORS hatası
- Frontend URL'inin doğru olduğundan emin ol
- `.env` dosyasında `FRONTEND_URL=http://localhost:3000` olduğundan emin ol

### Build hatası
- TypeScript hatalarını kontrol et: `npm run build`
- Dependencies'leri yeniden yükle: `npm install`

## Hızlı Başlangıç

1. Firebase projesi oluştur
2. Service account key indir
3. `.env` dosyası oluştur ve bilgileri ekle
4. Firestore veritabanını etkinleştir
5. `npm run test-firebase` ile test et
6. `npm run dev` ile çalıştır
7. `npm run seed` ile başlangıç verilerini yükle
