import { Field, InputType, ObjectType, PickType, Int } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';
import { CoreOutput } from '../../users/dtos/output.dto';
import { User } from '../../users/entities/user.entity';

@InputType()
export class CountSubscriptionsInput extends PickType(
  Podcast,
  ['id'],
  InputType,
) {}

@ObjectType()
export class CountSubscriptionsOutput extends CoreOutput {
  @Field(type => Int, { nullable: true })
  users?: number;
}
