import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';
import { CoreOutput } from './output.dto';

@InputType()
export class CreatePodcastInput extends PickType(
  Podcast,
  ['title', 'coverImg'],
  InputType,
) {
  @Field(type => String)
  categoryName: string;
}

@ObjectType()
export class CreatePodcastOutput extends CoreOutput {
  @Field(type => Int, { nullable: true })
  id?: number;
}
