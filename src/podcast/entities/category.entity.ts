import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { Podcast } from './podcast.entity';
import { CoreEntity } from '../../users/entities/core.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  @Length(2)
  name: string;

  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @Field(type => [Podcast], { nullable: true })
  @OneToMany(type => Podcast, podcast => podcast.category)
  podcasts: Podcast[];
}
