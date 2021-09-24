import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class UpdatePodcastInput extends PickType(Podcast, ['id'], InputType) {
  @Field(type => String, { nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(type => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(type => String, { nullable: true })
  @IsString()
  @IsOptional()
  coverImg?: string;
}
