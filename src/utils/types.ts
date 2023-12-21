export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Token {
  sub: string;
}

export interface GoogleUser {
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
  accessToken: string;
  refreshToken: string;
}
