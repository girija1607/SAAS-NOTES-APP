// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clear existing data to ensure a clean slate every time
  await prisma.note.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});
  console.log('✅ Cleared previous data.');

  // 2. Hash the common password once
  const hashedPassword = await bcrypt.hash('password', 10);

  // --- 3. Create Acme Tenant (FREE Plan) with an extra user ---
  await prisma.tenant.create({
    data: {
      name: 'Acme',
      slug: 'acme',
      // plan is not specified, so it defaults to FREE
      users: {
        create: [
          {
            email: 'admin@acme.test',
            password: hashedPassword,
            role: 'ADMIN',
          },
          {
            email: 'user@acme.test',
            password: hashedPassword,
            role: 'MEMBER',
          },
          // Added an extra user to an existing tenant
          {
            email: 'sara@acme.test',
            password: hashedPassword,
            role: 'MEMBER',
          },
        ],
      },
    },
  });
  console.log('✅ Created Acme (FREE) tenant and users.');

  // --- 4. Create Globex Tenant (FREE Plan) ---
  await prisma.tenant.create({
    data: {
      name: 'Globex',
      slug: 'globex',
      // plan is not specified, so it defaults to FREE
      users: {
        create: [
          {
            email: 'admin@globex.test',
            password: hashedPassword,
            role: 'ADMIN',
          },
          {
            email: 'user@globex.test',
            password: hashedPassword,
            role: 'MEMBER',
          },
        ],
      },
    },
  });
  console.log('✅ Created Globex (FREE) tenant and users.');

  // --- 5. Create a new Tenant that is PRO from the start ---
  await prisma.tenant.create({
    data: {
      name: 'Stark Industries',
      slug: 'stark',
      plan: 'PRO', // This tenant starts with the PRO plan
      users: {
        create: [
          {
            email: 'tony@stark.test',
            password: hashedPassword,
            role: 'ADMIN',
          },
          {
            email: 'pepper@stark.test',
            password: hashedPassword,
            role: 'MEMBER',
          },
        ],
      },
    },
  });
  console.log('✅ Created Stark Industries (PRO) tenant and users.');


  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });