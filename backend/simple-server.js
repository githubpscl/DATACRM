const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// In-Memory Database (for demo purposes)
const users = [];
const customers = [];
const campaigns = [];

// Mock data
const demoUser = {
  id: '1',
  email: 'admin@demo.com',
  password: bcrypt.hashSync('password123', 10),
  firstName: 'Demo',
  lastName: 'Admin',
  role: 'admin',
  companyId: '1',
  company: {
    id: '1',
    name: 'Demo Company',
    domain: 'demo.com'
  },
  createdAt: new Date().toISOString()
};
users.push(demoUser);

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
      company: user.company
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server Fehler' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, companyName } = req.body;
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Benutzer existiert bereits' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = (users.length + 1).toString();
    const companyId = (Math.random() * 1000).toString();

    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'admin',
      companyId,
      company: {
        id: companyId,
        name: companyName || 'Mein Unternehmen',
        domain: email.split('@')[1]
      },
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      companyId: newUser.companyId,
      company: newUser.company
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server Fehler' });
  }
});

// Customer Routes
app.get('/api/customers', (req, res) => {
  const mockCustomers = [
    {
      id: '1',
      firstName: 'Anna',
      lastName: 'Schmidt',
      email: 'anna.schmidt@example.com',
      phone: '+49 170 1234567',
      company: 'TechStart GmbH',
      position: 'Marketing Director',
      address: {
        street: 'Hauptstraße 123',
        city: 'München',
        state: 'Bayern',
        postalCode: '80331',
        country: 'Deutschland'
      },
      tags: ['premium', 'tech'],
      status: 'active',
      source: 'Website',
      createdAt: '2024-01-15',
      lastActivity: '2024-01-20',
      totalValue: 15000
    },
    {
      id: '2',
      firstName: 'Michael',
      lastName: 'Weber',
      email: 'michael.weber@corp.com',
      phone: '+49 171 9876543',
      company: 'Corporate Solutions',
      position: 'CEO',
      address: {
        street: 'Geschäftsstraße 45',
        city: 'Hamburg',
        state: 'Hamburg',
        postalCode: '20095',
        country: 'Deutschland'
      },
      tags: ['enterprise', 'vip'],
      status: 'prospect',
      source: 'LinkedIn',
      createdAt: '2024-01-10',
      lastActivity: '2024-01-18',
      totalValue: 25000
    }
  ];
  
  res.json({ customers: mockCustomers });
});

// Campaign Routes
app.get('/api/campaigns', (req, res) => {
  const mockCampaigns = [
    {
      id: '1',
      name: 'Willkommensserie Neukunden',
      description: 'Automatisierte E-Mail-Serie für neue Kunden',
      type: 'email',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      targetAudience: {
        total: 1250,
        segmentName: 'Neukunden 2024'
      },
      metrics: {
        sent: 3456,
        delivered: 3398,
        opened: 1876,
        clicked: 567,
        converted: 89,
        revenue: 12450
      },
      createdAt: '2024-01-10',
      updatedAt: '2024-01-20',
      createdBy: 'admin'
    }
  ];
  
  res.json({ campaigns: mockCampaigns });
});

// Analytics Routes
app.get('/api/analytics', (req, res) => {
  const mockAnalytics = {
    overview: {
      totalCustomers: 2847,
      totalCampaigns: 23,
      totalRevenue: 145670,
      averageOrderValue: 287.50,
      customerGrowthRate: 12.5,
      campaignSuccessRate: 78.3
    },
    campaignMetrics: {
      totalSent: 45680,
      deliveryRate: 98.7,
      openRate: 24.3,
      clickRate: 4.2,
      conversionRate: 2.8,
      unsubscribeRate: 0.3
    }
  };
  
  res.json({ analytics: mockAnalytics });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Frontend: http://localhost:3000`);
  console.log(`🔗 Backend: http://localhost:${PORT}`);
  console.log(`👤 Demo Login: admin@demo.com / password123`);
});
