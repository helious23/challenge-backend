import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';

@InputType()
export class ToggleLikeInput {
  @Field(type => Number)
  podcastId: number;
}

@ObjectType()
export class ToggleLikeOutput extends CoreOutput {}
