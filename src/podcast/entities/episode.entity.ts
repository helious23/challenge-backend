import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, IsNumber, Min, Max } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CoreEntity } from './core.entity';
import { Podcast } from './podcast.entity';

@Entity()
@ObjectType()
@InputType('EpisodeInputType', { isAbstract: true })
export class Episode extends CoreEntity {
  @Column()
  @Field(type => String)
  @IsString()
  title: string;

  @ManyToOne(() => Podcast, podcast => podcast.episodes, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @Field(type => Podcast)
  podcast: Podcast;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  episodeUrl?: string;

  @Field(type => Number, { nullable: true, defaultValue: 0 })
  @Column({ default: 0, nullable: true })
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;
}
