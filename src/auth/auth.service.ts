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
import type { GoogleUser, Token, TokenResponse } from 'src/utils/types';
import axios from 'axios';
import { UpdateUserDto } from 'src/users/users.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validate(username: string, password: string): Promise<User> {
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
    };

    let refreshToken: string;

    if (process.env.ACCESS_TOKEN_EXPIRATION) {
      refreshToken = await this.jwtService.signAsync(
        payload,
        this.getRefreshTokenOptions(),
      );
    }

    return {
      ...user,
      accessToken: await this.jwtService.signAsync(
        payload,
        this.getAccessTokenOptions(),
      ),
      refreshToken,
    };
  }

  getRefreshTokenOptions(): JwtSignOptions {
    return this.getTokenOptions('refresh');
  }

  getAccessTokenOptions(): JwtSignOptions {
    return this.getTokenOptions('access');
  }

  getTokenOptions(type: 'refresh' | 'access') {
    const jwtSecret =
      type === 'refresh'
        ? process.env.REFRESH_TOKEN_SECRET
        : process.env.ACCESS_TOKEN_SECRET;
    const expiration =
      type === 'refresh'
        ? process.env.REFRESH_TOKEN_EXPIRATION
        : process.env.ACCESS_TOKEN_EXPIRATION;
    const options: JwtSignOptions = {
      secret: `${jwtSecret}`,
    };

    if (expiration) {
      options.expiresIn = expiration;
    }

    return options;
  }

  async verifyAccessToken(accessToken: string) {
    const options = this.getAccessTokenOptions();
    try {
      const decoded = await this.jwtService.verifyAsync(accessToken, options);

      return decoded;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Access token is invalid');
    }
  }

  async isTokenExpired(accessToken: string): Promise<boolean> {
    try {
      const { exp } = await this.jwtService.decode(accessToken);
      const now = Date.now() / 1000;
      return now < exp;
    } catch (err) {
      console.error("Couldn't decode the access token: ", err);
      throw new UnauthorizedException('Token expired');
    }
  }

  async generateNewAccessToken(uid: string): Promise<string> {
    try {
      const newAccessToken = await this.jwtService.signAsync(
        { sub: uid },
        this.getAccessTokenOptions(),
      );
      return newAccessToken;
    } catch (err) {
      console.error('Failed to generate a new token: ', err);
      throw new Error('Failed to refresh the access token');
    }
  }

  async getCurrentUserProfile(token: string) {
    try {
      return axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`,
      );
    } catch (err) {
      console.error('Failed to revoke the token:', err);
    }
  }

  async getProfile(token: string) {
    try {
      const userProfile = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`,
      );

      const updatedUserProfile: UpdateUserDto = {
        username: userProfile.data.name,
        email: userProfile.data.email,
        displayPicture: userProfile.data.picture,
        currency: 'INR',
      };

      return this.userService.update(updatedUserProfile);
    } catch (error) {
      console.error('Failed to revoke the token:', error);
    }
  }

  async createOrUpdateUser(user: GoogleUser) {
    try {
      const username = `${user.firstName}${user.lastName}`;
      const existingUser = await this.userService.getUser(
        user.email ?? username,
      );

      if (existingUser) {
        const updatedUser = await this.userService.update({
          username: user.email,
          email: user.email,
          displayPicture: user.picture,
        });
        return updatedUser;
      }

      const createdUser = await this.userService.create({
        username: user.email,
        email: user.email,
        displayPicture: user.picture,
      });

      return createdUser;
    } catch (err) {
      console.error('Failed to update user: ', err);
    }
  }

  async revokeGoogleToken(token: string) {
    try {
      await axios.get(
        `https://accounts.google.com/o/oauth2/revoke?token=${token}`,
      );
    } catch (err) {
      console.error('Failed to revoke the token: ', err);
    }
  }
}
