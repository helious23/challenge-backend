import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Review } from '../entities/review.entity';
import { CoreOutput } from './output.dto';
import { IsNumber } from 'class-validator';

@InputType()
export class DeleteReviewInput extends PickType(Review, ['id'], InputType) {}

@ObjectType()
export class DeleteReviewOutput extends CoreOutput {
  @Field(type => Int)
  reviewId?: number;
}
