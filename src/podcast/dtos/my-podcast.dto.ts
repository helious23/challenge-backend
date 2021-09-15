import { ObjectType, InputType, Field, Int } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';
import { CoreOutput } from '../../users/dtos/output.dto';

@InputType()
export class MyPodcastInput {
  @Field(type => Int)
  id: number;
}

@ObjectType()
export class MyPodcastOutput extends CoreOutput {
  @Field(type => Podcast, { nullable: true })
  podcast?: Podcast;
}
