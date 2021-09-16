import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationInput, PaginationOutput } from './pagination.dto';
import { Podcast } from '../entities/podcast.entity';
import { CoreOutput } from '../../users/dtos/output.dto';

@ObjectType()
export class PromotionPodcastsOutput extends CoreOutput {
  @Field(type => [Podcast], { nullable: true })
  results?: Podcast[];
}
