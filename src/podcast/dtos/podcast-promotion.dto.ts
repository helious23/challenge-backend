import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';
import { CoreOutput } from '../../users/dtos/output.dto';

@InputType()
export class PodcastPromotionInput extends PickType(
  Podcast,
  ['id'],
  InputType,
) {}
