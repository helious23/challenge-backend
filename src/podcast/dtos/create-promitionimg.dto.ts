import { InputType, ObjectType, PickType, Field } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';
import { CoreOutput } from '../../users/dtos/output.dto';

@InputType()
export class CreatePromotionImgInput extends PickType(
  Podcast,
  ['id'],
  InputType,
) {
  @Field(type => String, { nullable: true })
  promotionImage?: string;
}

@ObjectType()
export class CreatePromotionImgOutput extends CoreOutput {}
