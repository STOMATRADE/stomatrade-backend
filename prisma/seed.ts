import { PrismaClient, ROLES, GENDER } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding user, collector, farmer, land...');

  // ======================
  // 1. USER
  // ======================
  const admin = await prisma.user.create({
    data: {
      walletAddress: '0xADMINWALLET123',
      role: ROLES.ADMIN,
    },
  });

  const collectorUser = await prisma.user.create({
    data: {
      walletAddress: '0xCOLLECTORWALLET123',
      role: ROLES.COLLECTOR,
    },
  });

  console.log('Created Users:', admin.id, collectorUser.id);

  // ======================
  // 2. COLLECTOR
  // ======================
  const collector = await prisma.collector.create({
    data: {
      userId: collectorUser.id,
      nik: '1234567890123456',
      name: 'Collector One',
      address: 'Jl. Raya Kebon Jeruk No. 12',
    },
  });

  console.log('Created Collector:', collector.id);

  // ======================
  // 3. FARMERS
  // ======================
  const farmer1 = await prisma.farmer.create({
    data: {
      collectorId: collector.id,
      nik: '9900112233445566',
      name: 'Farmer A',
      age: 40,
      gender: GENDER.MALE,
      address: 'Desa Harapan Jaya',
    },
  });

  const farmer2 = await prisma.farmer.create({
    data: {
      collectorId: collector.id,
      nik: '8800112233445566',
      name: 'Farmer B',
      age: 35,
      gender: GENDER.FEMALE,
      address: 'Desa Mekar Sari',
    },
  });

  console.log('Created Farmers:', farmer1.id, farmer2.id);

  // ======================
  // 4. LANDS
  // ======================
  await prisma.land.createMany({
    data: [
      {
        farmerId: farmer1.id,
        tokenId: 1,
        latitude: -6.2001,
        longitude: 106.8168,
        address: 'Lahan A - Blok 1',
      },
      {
        farmerId: farmer1.id,
        tokenId: 2,
        latitude: -6.2005,
        longitude: 106.8171,
        address: 'Lahan A - Blok 2',
      },
      {
        farmerId: farmer2.id,
        tokenId: 3,
        latitude: -6.2101,
        longitude: 106.8200,
        address: 'Lahan B - Blok 1',
      },
    ],
  });

  console.log('Created Lands');
}

main()
  .then(async () => {
    console.log('🌱 Seeding completed!');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
