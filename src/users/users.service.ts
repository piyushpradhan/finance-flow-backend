import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
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
      uid: uuidv4(),
      currency: 'INR',
      username: createUserDto.email,
    });

    try {
      const createdUser = await user.save();
      return createdUser;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async update(updateUserDto: UpdateUserDto): Promise<User> {
    const user = new this.userModel(updateUserDto);
    try {
      const updatedUser = await this.userModel
        .findOneAndUpdate({
          email: user.email,
        })
        .lean();

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
    return this.userModel.find().lean();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findOne((user: User) => user.uid === id).lean();
  }

  async getUserByName(name: string): Promise<User> {
    const username = { $regex: new RegExp(`^${name}$`, 'i') };
    return this.userModel.findOne({ username }).lean();
  }

  async getUserByEmail(email: string): Promise<User> {
    const userEmail = { $regex: new RegExp(`^${email}$`, 'i') };
    return this.userModel.findOne({ email: userEmail }).lean();
  }

  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id).lean();
  }

  async getUser(target: string) {
    const userByName = await this.getUserByName(target);
    const userByEmail = await this.getUserByEmail(target);

    return userByName ?? userByEmail;
  }

  async validateUserById(id: string) {
    const user = await this.getUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
