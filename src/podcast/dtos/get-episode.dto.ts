import { InputType, ObjectType, PickType, Field, Int } from '@nestjs/graphql';
import { Episode } from '../entities/episode.entity';
import { CoreOutput } from '../../users/dtos/output.dto';

@InputType()
export class GetEpisodeInput {
  @Field(type => Int)
  podcastId: number;

  @Field(type => Int)
  episodeId: number;
}

@ObjectType()
export class GetEpisodeOutput extends CoreOutput {
  @Field(type => Episode, { nullable: true })
  episode?: Episode;
}
