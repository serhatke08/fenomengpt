# Supabase Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### 1. Supabase Projesi Hazır
- **URL**: https://qwxomwldmuwcridqhnlb.supabase.co
- **Anon Key**: Zaten env.example dosyasında mevcut

### 2. Veritabanı Tablolarını Oluştur

1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **SQL Editor**'e tıklayın
4. `database/supabase_schema.sql` dosyasındaki SQL script'ini kopyalayın
5. SQL Editor'de yapıştırın ve **Run** butonuna tıklayın

### 3. Service Role Key'i Alın

1. Supabase Dashboard'da **Settings** > **API**'ye gidin
2. **service_role** key'i kopyalayın (⚠️ Bu key'i asla frontend'de kullanmayın!)
3. Backend `.env` dosyasına ekleyin:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 4. Environment Variables

#### Backend (.env)
```env
SUPABASE_URL=https://qwxomwldmuwcridqhnlb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3eG9td2xkbXV3Y3JpZHFobmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzc0MDMsImV4cCI6MjA4MDk1MzQwM30.V3bqYAV1jLkeOAxBL0GM07Tg_8ldYnmIKTeUdUO8YqM
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=your_jwt_secret_key_here
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://qwxomwldmuwcridqhnlb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3eG9td2xkbXV3Y3JpZHFobmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzc0MDMsImV4cCI6MjA4MDk1MzQwM30.V3bqYAV1jLkeOAxBL0GM07Tg_8ldYnmIKTeUdUO8YqM
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📋 Özellikler

### ✅ Tamamlanan
- ✅ Supabase Auth entegrasyonu (Kayıt/Giriş)
- ✅ User modeli Supabase'e çevrildi
- ✅ Auth controller Supabase Auth kullanıyor
- ✅ JWT token sistemi (backend)
- ✅ Row Level Security (RLS) politikaları

### 🔄 Kullanım

#### Kayıt Ol
```bash
POST /api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

#### Giriş Yap
```bash
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Profil Görüntüle
```bash
GET /api/auth/profile
Headers: Authorization: Bearer <token>
```

## 🔐 Güvenlik

- **Service Role Key**: Sadece backend'de kullanılır, asla frontend'e gönderilmez
- **Anon Key**: Frontend'de kullanılır, RLS politikaları ile korunur
- **JWT Tokens**: Backend tarafından oluşturulur ve doğrulanır
- **Row Level Security**: Kullanıcılar sadece kendi verilerini görebilir

## 📝 Notlar

- Supabase Auth kullanıcı oluştururken otomatik olarak `auth.users` tablosuna ekler
- Bizim `users` tablosu profil bilgilerini saklar (username, balance, role, vb.)
- İki tablo `id` ile bağlantılıdır (users.id = auth.users.id)

## 🐛 Sorun Giderme

### "Failed to create user" hatası
- Supabase Auth ayarlarını kontrol edin
- Email confirmation'ı kapatabilirsiniz (Settings > Auth > Email Auth)

### "Row Level Security" hatası
- RLS politikalarının doğru kurulduğundan emin olun
- Service role key'in doğru olduğunu kontrol edin

### "Table does not exist" hatası
- SQL script'inin çalıştırıldığından emin olun
- Supabase Dashboard'da tabloları kontrol edin

