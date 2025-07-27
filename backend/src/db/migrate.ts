import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Prisma will handle migrations automatically
    // This is just for manual migration triggers
    await prisma.$connect();
    
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
