import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { User } from 'src/schema/user.schema';
import { validatePassword } from 'src/utils/auth';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Token {
  sub: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validate(username: string, password: string) {
    const user = await this.userService.getUser(username);

    if (
      !user ||
      !(await validatePassword({ stored: user.password, provided: password }))
    ) {
      throw new UnauthorizedException('Incorrect password or does not exist');
    }

    return user;
  }

  async login(user: User): Promise<TokenResponse> {
    const payload: Token = {
      sub: user.uid,
      username: user.username,
    };

    let refreshToken: string;

    if (process.env.ACCESS_TOKEN_EXPIRATION) {
      refreshToken = await this.jwtService.signAsync(
        payload,
        this.getRefreshTokenOptions(user),
      );
    }

    return {
      accessToken: await this.jwtService.signAsync(
        payload,
        this.getAccessTokenOptions(user),
      ),
      refreshToken,
    };
  }

  getRefreshTokenOptions(user: User): JwtSignOptions {
    return this.getTokenOptions('refresh', user);
  }

  getAccessTokenOptions(user: User): JwtSignOptions {
    return this.getTokenOptions('access', user);
  }

  private getTokenOptions(type: 'refresh' | 'access', user: User) {
    const jwtSecret =
      type === 'refresh'
        ? process.env.REFRESH_TOKEN_SECRET
        : process.env.ACCESS_TOKEN_SECRET;
    const expiration =
      type === 'refresh'
        ? process.env.REFRESH_TOKEN_EXPIRATION
        : process.env.ACCESS_TOKEN_EXPIRATION;
    const options: JwtSignOptions = {
      secret: `${jwtSecret} ${user.sessionToken}`,
    };

    if (expiration) {
      options.expiresIn = expiration;
    }

    return options;
  }
}
