import { LoginDto, RegisterDto } from './auth.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { Public } from 'src/decorators/public.decorator';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(
      await this.authService.validate(body.username, body.password),
    );
  }

  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto) {
    if (await this.userService.getUserByName(body.username)) {
      throw new BadRequestException('Username already exists');
    }

    if (await this.userService.getUserByEmail(body.email)) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.userService.create(body);

    return this.authService.login(user);
  }

  @Public()
  @Get('google')
  googleLogin() {}

  @Public()
  @Get('google/callback')
  googleLoginCallback(@Request() req, @Res() res: Response): void {
    const googleToken = req.user.accessToken;
    const googleRefreshToken = req.user.refreshToken;

    res.cookie('access_token', googleToken, { httpOnly: true });
    res.cookie('refresh_token', googleRefreshToken, { httpOnly: true });

    // TODO: Change this later
    // res.redirect('http://localhost:3000/users');
  }
}
