import { Body, Controller, Get, Post, Patch, Query, Param } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: { email: string; firstName?: string; lastName?: string }) {
    return this.usersService.create(body)
  }

  @Get()
  findAll(@Query('page') page?: string) {
    return this.usersService.findAll({ page: page ? Number(page) : 1 })
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { email?: string; firstName?: string; lastName?: string },
  ) {
    return this.usersService.update(id, body)
  }
}
