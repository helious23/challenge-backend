import { ObjectType, Field } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';
import { Episode } from '../../podcast/entities/episode.entity';

@ObjectType()
export class ListenedEpisodeOutput extends CoreOutput {
  @Field(type => [Episode], { nullable: true })
  listenedEpisode?: Episode[];
}
