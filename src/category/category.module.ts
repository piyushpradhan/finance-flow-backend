import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category, CategorySchema } from 'src/schema/category.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, UsersService, AuthService, JwtService],
  exports: [CategoryService],
})
export class CategoryModule {}
