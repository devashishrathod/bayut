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
  const commercial = await prisma.category.findFirst({
    where: { type: 'commercial' },
    include: { subCategories: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!commercial) {
    console.log('Commercial category not found');
    return;
  }

  const names = commercial.subCategories.map((s) => s.name);

  console.log('Commercial category:', commercial.id, commercial.name);
  console.log('Has Other:', names.includes('Other'));
  console.log('Has Other Commercial:', names.includes('Other Commercial'));
  console.log('\nCommercial subcategories:');
  for (const n of names) console.log('- ' + n);

  const anyOtherCommercial = await prisma.subCategory.findMany({
    where: { name: 'Other Commercial' },
    select: { id: true, name: true, categoryId: true },
  });

  console.log('\nRows named Other Commercial (any category):', anyOtherCommercial.length);
  if (anyOtherCommercial.length) {
    for (const row of anyOtherCommercial) {
      console.log(row);
    }
  }
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
