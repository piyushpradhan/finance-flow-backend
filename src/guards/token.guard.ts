import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';

@Injectable()
export class CheckTokenExpiryGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();
    const accessToken =
      request.cookies['access_token'] ?? this.extractTokenFromHeader(request);

    if (await this.authService.isTokenExpired(accessToken)) {
      const refreshToken = request.cookies['refresh_token'];

      if (!refreshToken) {
        throw new UnauthorizedException(
          'User is unauthorized: refresh token not found',
        );
      }

      try {
        const newAccessToken =
          this.authService.generateNewAccessToken(refreshToken);
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

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const accessToken = type === 'Bearer' ? token : undefined;
    return accessToken;
  }
}
