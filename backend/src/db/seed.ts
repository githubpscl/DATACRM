import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a demo company
    const company = await prisma.company.create({
      data: {
        name: 'Demo Company',
        domain: 'demo.com',
        industry: 'Technology',
        size: '1-10'
      }
    });

    // Create demo admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFmNkQbqOmQ8aKW', // password123
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        companyId: company.id,
        isActive: true,
        emailVerified: true
      }
    });

    // Create demo customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          email: 'customer1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          companyId: company.id,
          status: 'ACTIVE',
          source: 'MANUAL',
          tags: ['premium', 'early-adopter']
        }
      }),
      prisma.customer.create({
        data: {
          email: 'customer2@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          companyId: company.id,
          status: 'ACTIVE',
          source: 'MANUAL',
          tags: ['standard']
        }
      })
    ]);

    // Create demo segments
    const segment = await prisma.segment.create({
      data: {
        name: 'Premium Customers',
        description: 'High-value customers with premium status',
        conditions: { tags: { contains: 'premium' } },
        companyId: company.id,
        createdBy: adminUser.id
      }
    });

    // Create demo template
    const template = await prisma.template.create({
      data: {
        name: 'Welcome Email',
        type: 'EMAIL',
        subject: 'Welcome to {{company_name}}!',
        content: '<h1>Welcome {{first_name}}!</h1><p>Thank you for joining us.</p>',
        companyId: company.id,
        category: 'welcome'
      }
    });

    console.log('✅ Database seeded successfully!');
    console.log(`📧 Admin login: admin@demo.com / password123`);
    console.log(`🏢 Company: ${company.name} (ID: ${company.id})`);
    console.log(`👥 Created ${customers.length} demo customers`);
    console.log(`🎯 Created demo segment: ${segment.name}`);
    console.log(`📄 Created demo template: ${template.name}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
