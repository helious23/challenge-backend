import {
  ObjectType,
  Field,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsString, IsEmail } from 'class-validator';
import {
  Column,
  Entity,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CoreEntity } from './core.entity';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { Podcast } from '../../podcast/entities/podcast.entity';
import { Episode } from '../../podcast/entities/episode.entity';
import { Review } from '../../podcast/entities/review.entity';

export enum UserRole {
  Host = 'Host',
  Listener = 'Listener',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field(type => String)
  @IsEmail()
  email: string;

  @Column()
  @Field(type => String)
  @IsString()
  password: string;

  @Column({ type: 'simple-enum', enum: UserRole })
  @Field(type => UserRole)
  role: UserRole;

  @OneToMany(() => Podcast, podcast => podcast.creator)
  @Field(type => [Podcast])
  podcasts: Podcast[];

  @OneToMany(() => Review, review => review.reviewer)
  @Field(type => [Review])
  reviews: Review[];

  @ManyToMany(() => Episode, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(type => [Episode], { nullable: true })
  @JoinTable()
  playedEpisodes?: Episode[];

  @ManyToMany(() => Podcast, podcast => podcast.subscriber, {
    eager: true,
    onDelete: 'CASCADE',
    cascade: true,
    nullable: true,
  })
  @Field(() => [Podcast], { nullable: true })
  @JoinTable()
  subscriptions?: Podcast[];

  @ManyToMany(() => Podcast, podcast => podcast.liker, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => [Podcast], { nullable: true })
  @JoinTable()
  likes?: Podcast[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (!this.password) {
      return;
    }
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
