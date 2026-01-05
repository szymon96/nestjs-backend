import { BadRequestException, Injectable, NotFoundException  } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: { email: string; firstName?: string; lastName?: string }) {
    try {
      return await this.prisma.user.create({
        data: { email: dto.email, firstName: dto.firstName ?? null, lastName: dto.lastName ?? null },
      })
    } catch (e: any) {
      if (e?.code === 'P2002') throw new BadRequestException('Email already exists')
      throw e
    }
  }

  async findAll(dto: { page?: number }) {
    const take = 10
    const page = Number.isFinite(dto.page) && (dto.page ?? 1) > 0 ? (dto.page as number) : 1
    const skip = (page - 1) * take

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: { id: 'desc' },
        select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
      }),
      this.prisma.user.count(),
    ])

    const itemsWithName = items.map((u) => ({
        ...u,
        name: [u.firstName, u.lastName].filter(Boolean).join(' '), // obsłuży null/undefined
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

  async update(id: string, dto: { email?: string; firstName?: string; lastName?: string }) {
    // budujemy data tylko z pól, które przyszły (żeby nie nadpisywać na null/undefined)
    const data: Record<string, any> = {}
    if (dto.email !== undefined) data.email = dto.email
    if (dto.firstName !== undefined) data.firstName = dto.firstName
    if (dto.lastName !== undefined) data.lastName = dto.lastName

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
      })
    } catch (e: any) {
      // Prisma: rekord nie istnieje
      if (e?.code === 'P2025') throw new NotFoundException('User not found')
      // Prisma: unique constraint (np. email)
      if (e?.code === 'P2002') throw new BadRequestException('Email already exists')
      throw e
    }
  }
}
