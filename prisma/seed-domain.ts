import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding domain data...');

  const domain = await prisma.domain.upsert({
    where: { domainCode: '001' },
    update: {},
    create: {
      domainCode: '001',
      domainDesc: 'SWITCHER ON OFF API',
      domainStatus: true,
    },
  });

  console.log('Domain created:', domain);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
