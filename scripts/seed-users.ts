import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

async function main() {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: false,
    })

    const prisma = app.get(PrismaService)

    try {
        // Cascade should clear posts as well
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" CASCADE`)
    } catch (e) {
        console.warn('Truncate failed (ignoring):', e instanceof Error ? e.message : e)
    }

    console.log('Seeding users with posts...')

    const count = 100

    for (let i = 1; i <= count; i++) {
        const postsCount = Math.floor(Math.random() * (5 - 2 + 1)) + 2
        const posts = Array.from({ length: postsCount }, (_, p) => ({
            title: `Title ${p + 1} for User ${i}`,
            content: `Content for post ${p + 1} of user ${i}. generated at ${new Date().toISOString()}`,
            published: true,
        }))

        await prisma.user.create({
            data: {
                email: `user${i}@example.com`,
                firstName: `First ${i}`,
                lastName: `Last ${i}`,
                posts: {
                    create: posts,
                },
            },
        })
    }

    console.log(`Seeded ${count} users with random posts.`)

    await app.close()
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
