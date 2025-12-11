const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Mock services endpoint
app.get('/api/services', (req, res) => {
  const mockServices = [
    {
      id: '1',
      name: 'Instagram Takipçi',
      platform: 'instagram',
      type: 'followers',
      description: 'Gerçek ve aktif Instagram takipçileri',
      price: 0.50,
      minQuantity: 100,
      maxQuantity: 10000,
      isActive: true
    },
    {
      id: '2',
      name: 'Instagram Beğeni',
      platform: 'instagram',
      type: 'likes',
      description: 'Instagram gönderilerine beğeni',
      price: 0.30,
      minQuantity: 50,
      maxQuantity: 5000,
      isActive: true
    },
    {
      id: '3',
      name: 'TikTok Takipçi',
      platform: 'tiktok',
      type: 'followers',
      description: 'TikTok takipçileri',
      price: 0.80,
      minQuantity: 100,
      maxQuantity: 5000,
      isActive: true
    },
    {
      id: '4',
      name: 'YouTube Görüntüleme',
      platform: 'youtube',
      type: 'views',
      description: 'YouTube video görüntülemeleri',
      price: 0.20,
      minQuantity: 1000,
      maxQuantity: 100000,
      isActive: true
    },
    {
      id: '5',
      name: 'Twitter Takipçi',
      platform: 'twitter',
      type: 'followers',
      description: 'Twitter takipçileri',
      price: 0.60,
      minQuantity: 100,
      maxQuantity: 10000,
      isActive: true
    },
    {
      id: '6',
      name: 'X (Twitter) Beğeni',
      platform: 'x',
      type: 'likes',
      description: 'X (Twitter) beğenileri',
      price: 0.40,
      minQuantity: 50,
      maxQuantity: 5000,
      isActive: true
    }
  ];

  res.json({
    success: true,
    data: mockServices
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
});

