# TurkTakipcim API Integration

Bu dokümantasyon, TurkTakipcim API'sinin projeye entegrasyonunu açıklar.

## Kurulum

### 1. Environment Variables

`.env` dosyasına aşağıdaki değişkeni ekleyin:

```env
TURKTAKIPCIM_API_KEY=your_turktakipcim_api_key_here
```

### 2. Dependencies

Gerekli paketler zaten yüklenmiştir:
- `axios`: HTTP istekleri için

## API Endpoints

### TurkTakipcim API Routes

#### Servisleri Senkronize Et (Admin Only)
```
POST /api/turkTakipcim/sync
```
TurkTakipcim API'sinden tüm servisleri çeker ve veritabanına kaydeder.

#### Bakiye Sorgula (Admin Only)
```
GET /api/turkTakipcim/balance
```
TurkTakipcim hesabındaki bakiyeyi getirir.

#### Sipariş Oluştur
```
POST /api/turkTakipcim/orders
Body: {
  "serviceId": 123,
  "link": "https://instagram.com/username",
  "quantity": 1000
}
```

#### Sipariş Durumu Sorgula
```
GET /api/turkTakipcim/orders/:orderId
```

#### Sipariş İptal Et
```
DELETE /api/turkTakipcim/orders/:orderId
```

### Webhook Endpoints

#### TurkTakipcim Webhook
```
POST /api/webhooks/turkTakipcim
```
TurkTakipcim'den gelen durum güncellemelerini işler.

## Servis Senkronizasyonu

### Manuel Senkronizasyon

Servisleri manuel olarak senkronize etmek için:

```bash
npm run sync-turkTakipcim
```

### API ile Senkronizasyon

Admin panelinden veya API ile:

```bash
curl -X POST http://localhost:5000/api/turkTakipcim/sync \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Sipariş Yönetimi

### Sipariş Oluşturma

Sipariş oluşturulduğunda:

1. Servis TurkTakipcim'den geliyorsa (`apiProvider: 'turkTakipcim'`)
2. TurkTakipcim API'sine sipariş gönderilir
3. Başarılı olursa sipariş durumu `in_progress` olur
4. External order ID kaydedilir

### Sipariş Durumu Güncelleme

#### Manuel Güncelleme
```
PUT /api/orders/:orderId/status
```

#### Webhook ile Otomatik Güncelleme
TurkTakipcim webhook URL'sini ayarlayın:
```
https://yourdomain.com/api/webhooks/turkTakipcim
```

## Veri Modeli

### Service Model
```typescript
interface IService {
  // ... existing fields
  apiProvider: string;        // 'turkTakipcim'
  apiServiceId: string;       // TurkTakipcim service ID
}
```

### Order Model
```typescript
interface IOrder {
  // ... existing fields
  apiOrderId?: string;        // TurkTakipcim order ID
  currentCount?: number;      // Mevcut sayı
  completionDate?: Date;      // Tamamlanma tarihi
}
```

## Durum Mapping

| TurkTakipcim Status | Internal Status | Açıklama |
|---------------------|-----------------|----------|
| Completed           | completed       | Tamamlandı |
| In progress         | in_progress     | İşlemde |
| Canceled            | cancelled       | İptal edildi |
| Partial             | in_progress     | Kısmen tamamlandı |

## Hata Yönetimi

### API Hataları
- TurkTakipcim API hatası durumunda sipariş `pending` olarak kalır
- Hata logları konsola yazdırılır
- Kullanıcıya uygun hata mesajı döndürülür

### Webhook Hataları
- Webhook işleme hatası durumunda 500 status döndürülür
- Hata logları konsola yazdırılır

## Test Etme

### 1. Servisleri Senkronize Et
```bash
npm run sync-turkTakipcim
```

### 2. Bakiye Kontrol Et
```bash
curl -X GET http://localhost:5000/api/turkTakipcim/balance \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Test Siparişi Oluştur
```bash
curl -X POST http://localhost:5000/api/turkTakipcim/orders \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 123,
    "link": "https://instagram.com/test",
    "quantity": 100
  }'
```

## Güvenlik

- Admin-only endpoint'ler authentication gerektirir
- Webhook endpoint'leri authentication gerektirmez (external service)
- API key environment variable'da saklanır
- Rate limiting tüm endpoint'lerde aktif

## Monitoring

- Tüm API çağrıları loglanır
- Hata durumları konsola yazdırılır
- Webhook işlemleri loglanır
- Sipariş durumu değişiklikleri loglanır
