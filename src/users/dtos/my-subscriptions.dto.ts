import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';
import { Podcast } from '../../podcast/entities/podcast.entity';

@ObjectType()
export class MySubscriptionOutput extends CoreOutput {
  @Field(type => [Podcast], { nullable: true })
  podcasts?: Podcast[];
}
