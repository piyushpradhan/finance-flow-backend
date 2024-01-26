import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Delete,
} from '@nestjs/common';
import { CheckTokenExpiryGuard } from 'src/guards/token.guard';
import { Category } from 'src/schema/category.schema';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/all')
  @UseGuards(CheckTokenExpiryGuard)
  async getAllCategories(@Request() request): Promise<Category[]> {
    // { uid: <userId> }
    const payload = request.body;
    return await this.categoryService.getAllCategories(payload);
  }

  @Get('/details')
  @UseGuards(CheckTokenExpiryGuard)
  async getCategory(@Request() request): Promise<Category> {
    // { uid: <userId>, id: <categoryId> }
    const payload = request.body;
    return await this.categoryService.getCategory(payload);
  }

  @Post('/create')
  @UseGuards(CheckTokenExpiryGuard)
  async createNewCategory(@Request() request): Promise<Category> {
    const newCategory = request.body;
    return await this.categoryService.create(newCategory);
  }

  @Post('/update')
  @UseGuards(CheckTokenExpiryGuard)
  async updateCategory(@Request() request): Promise<Category> {
    const updatedCategory = request.body;
    return await this.categoryService.update(updatedCategory);
  }

  @Delete('/delete')
  @UseGuards(CheckTokenExpiryGuard)
  async deleteCategory(@Request() request): Promise<Category[]> {
    const categoryToDelete = request.body;
    return await this.categoryService.delete(categoryToDelete);
  }
}
