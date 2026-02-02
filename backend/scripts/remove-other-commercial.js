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
  const commercialCategory = await prisma.category.findFirst({
    where: { type: 'commercial' },
  });

  if (!commercialCategory) {
    throw new Error('Commercial category not found');
  }

  const other = await prisma.subCategory.findFirst({
    where: { categoryId: commercialCategory.id, name: 'Other' },
  });

  if (!other) {
    throw new Error("Commercial subcategory 'Other' not found");
  }

  const otherCommercial = await prisma.subCategory.findFirst({
    where: { categoryId: commercialCategory.id, name: 'Other Commercial' },
  });

  if (!otherCommercial) {
    console.log("No 'Other Commercial' found. Nothing to delete.");
    return;
  }

  const reassigned = await prisma.property.updateMany({
    where: { subCategoryId: otherCommercial.id },
    data: { subCategoryId: other.id },
  });

  if (reassigned.count > 0) {
    console.log(
      `Reassigned ${reassigned.count} properties from 'Other Commercial' -> 'Other'.`,
    );
  }

  await prisma.subCategory.delete({ where: { id: otherCommercial.id } });
  console.log("Deleted 'Other Commercial' subcategory.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
