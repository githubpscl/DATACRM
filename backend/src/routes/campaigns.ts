import { Router } from 'express';
const router = Router();

// Placeholder routes
router.get('/', (req, res) => {
  res.json({ message: 'Campaigns endpoint' });
});

export default router;
