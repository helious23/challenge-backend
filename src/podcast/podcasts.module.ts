import { Module } from '@nestjs/common';
import { PodcastsService } from './podcasts.service';
import {
  EpisodeResolver,
  PodcastsResolver,
  ReviewResolver,
} from './podcasts.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Podcast } from './entities/podcast.entity';
import { Episode } from './entities/episode.entity';
import { Review } from './entities/review.entity';
import { CategoryRepository } from './repositories/category.repository';
import { PodcastRepository } from './repositories/podcast.repository';
import { CategoryResolver } from './podcasts.resolver';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PodcastRepository,
      Episode,
      Review,
      User,
      CategoryRepository,
    ]),
  ],
  providers: [
    PodcastsService,
    PodcastsResolver,
    EpisodeResolver,
    ReviewResolver,
    CategoryResolver,
  ],
})
export class PodcastsModule {}
