import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationInput, PaginationOutput } from './pagination.dto';
import { Podcast } from '../entities/podcast.entity';

@InputType()
export class MyPodcastsInput extends PaginationInput {}

@ObjectType()
export class MyPodcastsOutput extends PaginationOutput {
  @Field(type => [Podcast], { nullable: true })
  podcasts?: Podcast[];
}
