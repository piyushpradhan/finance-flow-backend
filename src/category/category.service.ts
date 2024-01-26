import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { Category } from 'src/schema/category.schema';
import {
  CreateCategoryDto,
  DeleteCategoryDto,
  GetAllCategoriesDto,
  GetCategoryDto,
  UpdateCategoryDto,
} from './category.dto';
import { User } from 'src/schema/user.schema';
import { randomUUID } from 'crypto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getAllCategories(
    getAllCategoriesDto: GetAllCategoriesDto,
  ): Promise<Category[]> {
    try {
      const user = await this.userModel
        .findById(getAllCategoriesDto.uid)
        .lean();
      const categoryIds = user.categories ?? [];

      const categories = await this.categoryModel
        .find({
          _id: {
            $in: categoryIds,
          },
        })
        .lean();

      return categories;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        `Couldn't get all the categories: ${err}`,
      );
    }
  }

  async getCategory(getCategoryDto: GetCategoryDto): Promise<Category> {
    try {
      const category = await this.categoryModel
        .findOne({
          uid: getCategoryDto.uid,
          _id: getCategoryDto.id,
        })
        .lean();

      return category;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        `Couldn't get one of your categories: ${err}`,
      );
    }
  }

  async create(newCategory: CreateCategoryDto): Promise<Category> {
    const category = new this.categoryModel({
      ...newCategory,
      transactions: newCategory.transactions ?? [],
      subCategories: newCategory.subCategories ?? [],
      isSubcategory: newCategory.isSubcategory ?? false,
    });

    try {
      if (newCategory.subCategories && newCategory.subCategories.length !== 0) {
        const subCategoryDocuments = newCategory.subCategories.map((item) => ({
          id: randomUUID(),
          name: item,
          transactions: [],
          subCategories: [],
          uid: newCategory.uid,
          isSubcategory: true,
        }));

        await this.categoryModel.insertMany(subCategoryDocuments);
      }
      const createdCategory = await category.save();

      // Add newly created categories to userdata
      await this.userModel.findByIdAndUpdate(newCategory.uid, {
        $push: {
          categories: createdCategory._id,
        },
      });
      return createdCategory;
    } catch (err) {
      console.error('Failed to create a category: ', err);
      throw new InternalServerErrorException(err);
    }
  }

  async update(updatedCategory: UpdateCategoryDto): Promise<Category> {
    try {
      const category = await this.categoryModel
        .findOneAndUpdate(
          {
            _id: updatedCategory.id,
            uid: updatedCategory.uid,
          },
          updatedCategory,
          { new: true },
        )
        .lean();
      return category;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to update category', err);
    }
  }

  async delete(deleteCategory: DeleteCategoryDto): Promise<Category[]> {
    try {
      console.log({ deleteCategory });
      const categoryToBeDeleted = await this.categoryModel
        .findOneAndDelete({
          name: deleteCategory.categoryName,
          uid: deleteCategory.uid,
        })
        .lean();

      console.log(categoryToBeDeleted);

      // Update user data if the deleted category is a parent category
      if (!categoryToBeDeleted.isSubcategory) {
        await this.userModel.findOneAndUpdate(
          {
            uid: deleteCategory.uid,
          },
          {
            $pop: {
              categories: categoryToBeDeleted._id,
            },
          },
        );
      }

      const categoriesAfterDeletion = this.categoryModel
        .find({
          uid: deleteCategory.uid,
        })
        .lean();
      return categoriesAfterDeletion;
    } catch (err) {
      console.error('Failed to delete category', err);
      throw new InternalServerErrorException(err);
    }
  }
}
