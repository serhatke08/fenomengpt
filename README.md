# Panel - Social Media Services Platform

Modern bir sosyal medya servisleri paneli. Next.js 15 ve Express.js ile geliştirilmiştir.

## 🚀 Teknoloji Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth

### Backend
- Node.js
- Express.js
- TypeScript
- Supabase (PostgreSQL)

## 📁 Proje Yapısı

```
panel/
├── frontend/          # Next.js frontend uygulaması
├── backend/           # Express.js backend API
└── README.md
```

## 🛠️ Kurulum

### Geliştirme Ortamı

1. **Repository'yi klonlayın:**
```bash
git clone <your-repo-url>
cd panel
```

2. **Backend kurulumu:**
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run dev
```

3. **Frontend kurulumu:**
```bash
cd frontend
npm install
cp .env.example .env.local
# .env.local dosyasını düzenleyin
npm run dev
```

## 🌐 Deployment

### Vercel (Frontend)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `.next`

### Render (Backend)
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

## 📝 Environment Variables

### Backend (.env)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
PORT=5000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📄 Lisans

MIT
