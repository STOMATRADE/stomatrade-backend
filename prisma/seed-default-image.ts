import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default image...');

  // Check if default image already exists
  const existingDefaultImage = await prisma.file.findFirst({
    where: {
      reffId: '404',
      deleted: false,
    },
  });

  if (existingDefaultImage) {
    console.log('Default image already exists:', existingDefaultImage.url);
    console.log('If you want to update it, delete the existing record first.');
    return;
  }

  // Insert default image with reffId "404"
  const defaultImage = await prisma.file.create({
    data: {
      reffId: '404',
      url: 'https://www.diw.co.id/images/image-not-available.png',
      type: 'default-image',
      deleted: false,
    },
  });

  console.log('Default image created successfully:');
  console.log('- ID:', defaultImage.id);
  console.log('- ReffId:', defaultImage.reffId);
  console.log('- URL:', defaultImage.url);
  console.log('\nYou can update this URL anytime by modifying the record with reffId="404" in the files table.');
}

main()
  .catch((e) => {
    console.error('Error seeding default image:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
