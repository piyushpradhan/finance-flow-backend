import {
  Controller,
  Get,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/schema/user.schema';
import { UsersService } from './users.service';
import { CheckTokenExpiryGuard } from 'src/guards/token.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/')
  @UseGuards(CheckTokenExpiryGuard)
  async getAllUsers(@Request() request): Promise<User[]> {
    const accessToken = request.cookies['access_token'];
    if (accessToken) return await this.userService.getAllUsers();
    throw new UnauthorizedException('No access token');
  }
}
