import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { User } from 'src/schema/user.schema';
import { UsersService } from './users.service';
import { CheckTokenExpiryGuard } from 'src/guards/token.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/')
  @UseGuards(CheckTokenExpiryGuard)
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  @UseGuards(CheckTokenExpiryGuard)
  async getUserDetails(@Param('id') id: string): Promise<User> {
    return await this.userService.getUser(id);
  }
}
