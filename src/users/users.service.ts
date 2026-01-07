import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto, FindAllUsersQueryDto, UpdateUserDto } from './users.dto'

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateUserDto) {
        try {
            return await this.prisma.user.create({
                data: { email: dto.email, firstName: dto.firstName ?? null, lastName: dto.lastName ?? null },
            })
        } catch (e: any) {
            if (e?.code === 'P2002') throw new BadRequestException('Email already exists')
            throw e
        }
    }

    async findAll(dto: FindAllUsersQueryDto) {
        const take = 10
        const page = dto.page ?? 1
        const skip = (page - 1) * take

        const [items, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                skip,
                take,
                orderBy: { id: 'desc' },
                select: { id: true, email: true, firstName: true, lastName: true, createdAt: true, posts: true },
            }),
            this.prisma.user.count(),
        ])

        const itemsWithName = items.map((u) => ({
            ...u,
            name: [u.firstName, u.lastName].filter(Boolean).join(' '), 
        }))

        const totalPages = Math.ceil(total / take)

        return {
            items: itemsWithName,
            meta: {
                page,
                take,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        }
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { posts: true },
        })

        if (!user) throw new NotFoundException('User not found')

        return user
    }

    async update(id: string, dto: UpdateUserDto) {
        const data = dto

        try {
            return await this.prisma.user.update({
                where: { id },
                data,
                select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
            })
        } catch (e: any) {
            if (e?.code === 'P2025') throw new NotFoundException('User not found')
            if (e?.code === 'P2002') throw new BadRequestException('Email already exists')
            throw e
        }
    }

    async delete(id: string) {
        try {
            await this.prisma.post.deleteMany({
                where: { authorId: id },
            })

            await this.prisma.user.delete({
                where: { id },
            })

            return { message: 'User deleted successfully' }
        } catch (e: any) {
            if (e?.code === 'P2025') throw new NotFoundException('User not found')
            throw e
        }
    }
}
