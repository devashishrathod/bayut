require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const beforeProperties = await prisma.property.count();

  // Implicit many-to-many table created by Prisma for Amenity<->Property
  // Delete join rows first to avoid FK constraint issues.
  await prisma.$executeRawUnsafe('DELETE FROM "_AmenityToProperty"');

  const deleted = await prisma.property.deleteMany({});

  const afterProperties = await prisma.property.count();

  console.log('Properties before:', beforeProperties);
  console.log('Properties deleted:', deleted.count);
  console.log('Properties after:', afterProperties);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
