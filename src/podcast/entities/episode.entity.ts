import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
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
}
