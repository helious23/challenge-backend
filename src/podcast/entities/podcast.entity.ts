import { Episode } from './episode.entity';
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, Min, Max, IsNumber } from 'class-validator';
import { Column, Entity, OneToMany, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from './core.entity';
import { Review } from './review.entity';
import { User } from '../../users/entities/user.entity';
import { Category } from './category.entity';

@Entity()
@ObjectType()
@InputType('PodcastInputType', { isAbstract: true })
export class Podcast extends CoreEntity {
  @Column()
  @Field(type => String)
  @IsString()
  title: string;

  @Field(type => Category, { nullable: true })
  @ManyToOne(type => Category, category => category.podcasts, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  category: Category;

  @Column({ default: 0 })
  @Field(type => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @Field(() => User)
  @ManyToOne(() => User, user => user.podcasts, {
    onDelete: 'CASCADE',
  })
  creator: User;

  @RelationId((podcast: Podcast) => podcast.creator)
  creatorId: number;

  @OneToMany(() => Episode, episode => episode.podcast)
  @Field(type => [Episode])
  episodes: Episode[];

  @OneToMany(() => Review, review => review.podcast)
  @Field(type => [Review])
  reviews: Review[];

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  coverImg?: string;
}
