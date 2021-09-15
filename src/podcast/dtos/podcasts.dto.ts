import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationInput, PaginationOutput } from './pagination.dto';
import { Podcast } from '../entities/podcast.entity';

@InputType()
export class PodcastsInput extends PaginationInput {}

@ObjectType()
export class PodcastsOutput extends PaginationOutput {
  @Field(type => [Podcast], { nullable: true })
  results?: Podcast[];
}
