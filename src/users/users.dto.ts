import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const createUserSchema = z.object({
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
})

export class CreateUserDto extends createZodDto(createUserSchema) { }

export const updateUserSchema = createUserSchema.partial()

export class UpdateUserDto extends createZodDto(updateUserSchema) { }

export const findAllUsersQuerySchema = z.object({
    page: z.coerce.number().min(1).optional(),
})

export class FindAllUsersQueryDto extends createZodDto(findAllUsersQuerySchema) { }
