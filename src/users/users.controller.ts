import { Controller, Get } from '@nestjs/common';
import { User } from 'src/schema/user.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/')
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }
}
