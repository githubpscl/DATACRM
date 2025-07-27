import { Router } from 'express';
const router = Router();

router.post('/stripe', (req, res) => {
  res.json({ message: 'Stripe webhook endpoint' });
});

export default router;
