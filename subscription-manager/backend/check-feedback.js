const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFeedback() {
  try {
    // Count feedback
    const count = await prisma.feedback.count();
    console.log('Total feedback entries:', count);
    
    // Get all feedback
    const feedback = await prisma.feedback.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\nAll feedback:');
    if (feedback.length === 0) {
      console.log('No feedback found in database');
    } else {
      feedback.forEach(f => {
        console.log({
          id: f.id,
          email: f.email,
          type: f.type,
          message: f.message.substring(0, 50) + (f.message.length > 50 ? '...' : ''),
          status: f.status,
          createdAt: f.createdAt
        });
      });
    }
    
    // Check if table exists
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='Feedback';`;
    console.log('\nFeedback table exists:', tables.length > 0);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeedback();