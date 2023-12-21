import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class CheckTokenExpiryGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();
    const accessToken = request.cookies['access_token'];

    if (await this.authService.isTokenExpired(accessToken)) {
      const refreshToken = request.cookies['refresh_token'];

      if (!refreshToken) {
        throw new UnauthorizedException(
          'User is unauthorized: refresh token not found',
        );
      }

      try {
        const newAccessToken =
          await this.authService.generateNewAccessToken(refreshToken);
        request.res.cookie('access_token', newAccessToken, {
          httpOnly: true,
        });
        request.cookies['access_token'] = newAccessToken;
      } catch (err) {
        console.error(err);
        throw new UnauthorizedException('unauthorized access');
      }
    }

    return true;
  }
}
