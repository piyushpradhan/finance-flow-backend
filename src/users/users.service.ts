import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schema/user.schema';
import { CreateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
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

  async getUser(target: string) {
    const getUserByName = await this.getUserByName(target);
    const getUserByEmail = await this.getUserByEmail(target);

    return getUserByName ?? getUserByEmail;
  }
}
