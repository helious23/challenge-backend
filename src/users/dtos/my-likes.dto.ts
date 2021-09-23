import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';
import { Podcast } from '../../podcast/entities/podcast.entity';

@InputType()
export class MyLikesInput {}

@ObjectType()
export class MyLikesOutput extends CoreOutput {
  @Field(type => [Podcast], { nullable: true })
  likes?: Podcast[];
}
