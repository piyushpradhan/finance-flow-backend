import { LoginDto, RegisterDto } from './auth.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CheckTokenExpiryGuard } from 'src/guards/token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const user = await this.authService.validate(body.username, body.password);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const authenticatedUser = await this.authService.login(user);
    return res.json({
      data: authenticatedUser,
      message: 'Login successful',
    });
  }

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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Request() req, @Res() res: Response): void {
    const googleToken = req.user.accessToken;
    const googleRefreshToken = req.user.refreshToken;

    if (req.user) {
      res.cookie('access_token', googleToken, { httpOnly: true });
      res.cookie('refresh_token', googleRefreshToken, { httpOnly: true });

      this.authService.createOrUpdateUser(req.user);

      res.json({
        message: 'User logged in successfully',
        data: {
          access_token: googleToken,
          refresh_token: googleRefreshToken,
        },
      });
    } else {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Get('google/profile')
  @UseGuards(CheckTokenExpiryGuard)
  async getProfile(@Request() req) {
    const accessToken = req.cookies['access_token'];
    if (accessToken) {
      return this.authService.getProfile(accessToken);
    }
    throw new UnauthorizedException('No access token');
  }

  @Get('logout')
  logout(@Req() req, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    this.authService.revokeGoogleToken(refreshToken);
    res.redirect('http://localhost:3000/');
  }
}
