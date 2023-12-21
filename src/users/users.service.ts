import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schema/user.schema';
import { CreateUserDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel({
      ...createUserDto,
      currency: 'INR',
      username: createUserDto.email,
    });

    try {
      const createdUser = await user.save();
      return {
        uid: `${createdUser._id}`,
        ...createdUser,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async update(updateUserDto: UpdateUserDto): Promise<User> {
    const user = new this.userModel(updateUserDto);
    try {
      const updatedUser = await this.userModel.findOneAndUpdate({
        email: user.email,
      });

      if (!updatedUser) {
        const createdUser = new this.userModel(updateUserDto);
        return createdUser.save();
      }

      return user;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Could not update user');
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findOne((user: User) => user.uid === id);
  }

  async getUserByName(name: string): Promise<User> {
    const username = { $regex: new RegExp(`^${name}$`, 'i') };
    return this.userModel.findOne({ username });
  }

  async getUserByEmail(email: string): Promise<User> {
    const userEmail = { $regex: new RegExp(`^${email}$`, 'i') };
    return this.userModel.findOne({ email: userEmail });
  }

  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  async getUser(target: string) {
    const getUserByName = await this.getUserByName(target);
    const getUserByEmail = await this.getUserByEmail(target);

    return getUserByName ?? getUserByEmail;
  }

  async validateUserById(id: string) {
    const user = await this.getUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
