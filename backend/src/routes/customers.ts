import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../index';
import { AuthRequest, requireCompanyAccess } from '../middleware/auth';

const router = Router();

// Get all customers for company
router.get('/', requireCompanyAccess, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 50, search, segment, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {
      companyId: req.user!.companyId
    };

    // Add search filter
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Add status filter
    if (status) {
      where.status = status;
    }

    // Add segment filter
    if (segment) {
      where.segments = {
        some: {
          segmentId: segment as string
        }
      };
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: offset,
        take: Number(limit),
        include: {
          segments: {
            include: {
              segment: true
            }
          },
          _count: {
            select: {
              campaignDeliveries: true,
              activities: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      customers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer by ID
router.get('/:id', requireCompanyAccess, async (req: AuthRequest, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      },
      include: {
        segments: {
          include: {
            segment: true
          }
        },
        campaignDeliveries: {
          include: {
            campaign: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        activities: {
          orderBy: { timestamp: 'desc' },
          take: 20
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create customer
router.post('/',
  requireCompanyAccess,
  [
    body('email').isEmail().normalizeEmail(),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('phone').optional().trim(),
    body('customFields').optional().isObject()
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, firstName, lastName, phone, customFields, tags } = req.body;

      // Check if customer already exists
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          email,
          companyId: req.user!.companyId
        }
      });

      if (existingCustomer) {
        return res.status(409).json({ error: 'Customer already exists' });
      }

      const customer = await prisma.customer.create({
        data: {
          email,
          firstName,
          lastName,
          phone,
          customFields,
          tags: tags || [],
          companyId: req.user!.companyId,
          source: 'MANUAL'
        },
        include: {
          segments: {
            include: {
              segment: true
            }
          }
        }
      });

      // Log activity
      await prisma.customerActivity.create({
        data: {
          customerId: customer.id,
          type: 'CUSTOM',
          title: 'Customer Created',
          description: 'Customer was manually created'
        }
      });

      res.status(201).json({ customer });
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update customer
router.put('/:id',
  requireCompanyAccess,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('phone').optional().trim(),
    body('customFields').optional().isObject()
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, firstName, lastName, phone, customFields, tags, status } = req.body;

      // Check if customer exists and belongs to company
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          id: req.params.id,
          companyId: req.user!.companyId
        }
      });

      if (!existingCustomer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const customer = await prisma.customer.update({
        where: { id: req.params.id },
        data: {
          ...(email && { email }),
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone && { phone }),
          ...(customFields && { customFields }),
          ...(tags && { tags }),
          ...(status && { status })
        },
        include: {
          segments: {
            include: {
              segment: true
            }
          }
        }
      });

      res.json({ customer });
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete customer
router.delete('/:id', requireCompanyAccess, async (req: AuthRequest, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await prisma.customer.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import customers from CSV/file
router.post('/import', requireCompanyAccess, async (req: AuthRequest, res) => {
  try {
    const { customers } = req.body;

    if (!Array.isArray(customers)) {
      return res.status(400).json({ error: 'Invalid customer data format' });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (const customerData of customers) {
      try {
        if (!customerData.email) {
          results.errors.push(`Missing email for customer: ${JSON.stringify(customerData)}`);
          continue;
        }

        // Check if customer already exists
        const existing = await prisma.customer.findFirst({
          where: {
            email: customerData.email,
            companyId: req.user!.companyId
          }
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        await prisma.customer.create({
          data: {
            email: customerData.email,
            firstName: customerData.firstName || null,
            lastName: customerData.lastName || null,
            phone: customerData.phone || null,
            customFields: customerData.customFields || {},
            tags: customerData.tags || [],
            companyId: req.user!.companyId,
            source: 'IMPORT'
          }
        });

        results.imported++;
      } catch (error) {
        results.errors.push(`Error importing ${customerData.email}: ${error}`);
      }
    }

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Import customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer analytics
router.get('/:id/analytics', requireCompanyAccess, async (req: AuthRequest, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const [
      totalCampaigns,
      openedCampaigns,
      clickedCampaigns,
      activities,
      segments
    ] = await Promise.all([
      prisma.campaignDelivery.count({
        where: { customerId: customer.id, status: 'SENT' }
      }),
      prisma.campaignDelivery.count({
        where: { customerId: customer.id, openedAt: { not: null } }
      }),
      prisma.campaignDelivery.count({
        where: { customerId: customer.id, clickedAt: { not: null } }
      }),
      prisma.customerActivity.count({
        where: { customerId: customer.id }
      }),
      prisma.customerSegment.count({
        where: { customerId: customer.id }
      })
    ]);

    const analytics = {
      totalCampaigns,
      openedCampaigns,
      clickedCampaigns,
      openRate: totalCampaigns > 0 ? (openedCampaigns / totalCampaigns) * 100 : 0,
      clickRate: totalCampaigns > 0 ? (clickedCampaigns / totalCampaigns) * 100 : 0,
      totalActivities: activities,
      totalSegments: segments,
      leadScore: customer.leadScore
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
