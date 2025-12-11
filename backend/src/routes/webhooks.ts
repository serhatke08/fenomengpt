import express from 'express';
import { followizWebhook } from '../controllers/webhookController';

const router = express.Router();

// Webhook routes (no authentication required for external services)
router.post('/followiz', followizWebhook);

export default router;
