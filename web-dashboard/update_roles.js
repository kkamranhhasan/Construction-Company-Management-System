const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Updating users with deleted roles...')
  // Using raw query to act directly on the database before Prisma client type checks block it
  await prisma.$executeRaw`UPDATE "User" SET "role" = 'WORKER'::"Role" WHERE "role" = 'HR'::"Role" OR "role" = 'ACCOUNTANT'::"Role"`;
  console.log('Roles updated to WORKER.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
