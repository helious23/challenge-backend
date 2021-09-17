import { Field, InputType, ObjectType, PickType, Int } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';
import { CoreOutput } from '../../users/dtos/output.dto';
import { User } from '../../users/entities/user.entity';

@InputType()
export class CountLikesInput extends PickType(Podcast, ['id'], InputType) {}

@ObjectType()
export class CountLikesOutput extends CoreOutput {
  @Field(type => Int, { nullable: true })
  users?: number;
}
