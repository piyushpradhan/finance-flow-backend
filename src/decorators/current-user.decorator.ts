import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { getClient } from 'src/utils/get-client';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => getClient(ctx)?.user,
);
