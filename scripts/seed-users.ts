import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  })

  const prisma = app.get(PrismaService)
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" CASCADE`)

  const count = 100

  const users = Array.from({ length: count }, (_, i) => ({
    email: `user${i + 1}@example.com`,
    firstName: `First ${i + 1}`,
    lastName: `Last ${i + 1}`,
  }))

  const result = await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  })

  console.log(`Seeded users: ${result.count}`)

  await app.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
