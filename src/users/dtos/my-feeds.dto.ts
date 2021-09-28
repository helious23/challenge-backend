import { ObjectType, Field } from '@nestjs/graphql';
import { Podcast } from '../../podcast/entities/podcast.entity';
import { CoreOutput } from './output.dto';

@ObjectType()
export class MyFeedsOutput extends CoreOutput {
  @Field(type => [Podcast], { nullable: true })
  podcasts?: Podcast[];
}
