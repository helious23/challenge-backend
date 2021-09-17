import { InputType, PickType } from '@nestjs/graphql';
import { Category } from '../entities/category.entity';

@InputType()
export class DeleteCategoryInput extends PickType(Category, ['id']) {}
