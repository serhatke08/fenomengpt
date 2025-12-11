const { initializeFirebase } = require('./dist/config/firebase');

async function testFirebase() {
  try {
    console.log('🔄 Firebase bağlantısı test ediliyor...');
    await initializeFirebase();
    console.log('✅ Firebase bağlantısı başarılı!');
    console.log('🚀 Backend çalıştırılmaya hazır!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Firebase bağlantısı başarısız:', error.message);
    console.log('💡 Lütfen FIREBASE_SETUP.md dosyasını kontrol edin');
    process.exit(1);
  }
}

testFirebase();
