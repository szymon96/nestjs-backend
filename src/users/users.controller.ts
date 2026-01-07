import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common'
import { ZodValidationPipe } from 'nestjs-zod'
import { CreateUserDto, FindAllUsersQueryDto, UpdateUserDto } from './users.dto'
import { UsersService } from './users.service'

@Controller('users')
@UsePipes(ZodValidationPipe)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Body() body: CreateUserDto) {
        return this.usersService.create(body)
    }

    @Get()
    findAll(@Query() query: FindAllUsersQueryDto) {
        return this.usersService.findAll(query)
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id)
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() body: UpdateUserDto,
    ) {
        return this.usersService.update(id, body)
    }

    @Delete(':id')
    delete(
        @Param('id') id: string,
    ) {
        return this.usersService.delete(id)
    }
}
