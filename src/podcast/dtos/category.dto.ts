import { Field, ObjectType, ArgsType, InputType } from '@nestjs/graphql';
import { Category } from '../entities/category.entity';
import { PaginationInput, PaginationOutput } from './pagination.dto';
import { Podcast } from '../entities/podcast.entity';

@InputType()
export class CategoryInput extends PaginationInput {
  @Field(type => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
  @Field(type => [Podcast], { nullable: true })
  podcasts?: Podcast[];

  @Field(type => Category, { nullable: true })
  category?: Category;
}
