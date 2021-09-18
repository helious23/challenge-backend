import { Injectable } from '@nestjs/common';
import {
  CreateEpisodeInput,
  CreateEpisodeOutput,
} from './dtos/create-episode.dto';
import {
  CreatePodcastInput,
  CreatePodcastOutput,
} from './dtos/create-podcast.dto';
import { UpdateEpisodeInput } from './dtos/update-episode.dto';
import { UpdatePodcastInput } from './dtos/update-podcast.dto';
import { Episode } from './entities/episode.entity';
import { Review } from './entities/review.entity';
import { Podcast } from './entities/podcast.entity';
import { CoreOutput } from './dtos/output.dto';
import {
  PodcastOutput,
  EpisodesOutput,
  EpisodesSearchInput,
  GetAllPodcastsOutput,
} from './dtos/podcast.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw, Like, ILike } from 'typeorm';
import {
  SearchPodcastsInput,
  SearchPodcastsOutput,
} from './dtos/search-podcasts.dto';
import {
  CreateReviewInput,
  CreateReviewOutput,
} from './dtos/create-review.dto';
import { User } from 'src/users/entities/user.entity';
import { CategoryRepository } from './repositories/category.repository';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { PodcastRepository } from './repositories/podcast.repository';
import { MyPodcastsInput, MyPodcastsOutput } from './dtos/my-podcasts.dto';
import { MyPodcastInput, MyPodcastOutput } from './dtos/my-podcast.dto';
import { PodcastsInput, PodcastsOutput } from './dtos/podcasts.dto';
import { PromotionPodcastsOutput } from './dtos/promotion-podcasts.dto';
import { PodcastPromotionInput } from './dtos/podcast-promotion.dto';
import { DeleteCategoryInput } from './dtos/delete-category.dto';
import { CountLikesInput, CountLikesOutput } from './dtos/count-likes.dto';
import { GetEpisodeInput, GetEpisodeOutput } from './dtos/get-episode.dto';
import {
  DeleteReviewInput,
  DeleteReviewOutput,
} from './dtos/delete-review.dto';
import {
  CountSubscriptionsInput,
  CountSubscriptionsOutput,
} from './dtos/count-subscriptions.dto';

@Injectable()
export class PodcastsService {
  constructor(
    private readonly podcastRepository: PodcastRepository,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly categories: CategoryRepository,
  ) {}

  private readonly InternalServerErrorOutput = {
    ok: false,
    error: 'Internal server error occurred.',
  };

  async getAllPodcasts(): Promise<GetAllPodcastsOutput> {
    try {
      const podcasts = await this.podcastRepository.find();
      return {
        ok: true,
        podcasts,
      };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async createPodcast(
    creator: User,
    createPodcastInput: CreatePodcastInput,
  ): Promise<CreatePodcastOutput> {
    try {
      const newPodcast = this.podcastRepository.create(createPodcastInput);
      newPodcast.promotionImg = createPodcastInput.promotionImage;
      newPodcast.creator = creator;

      const category = await this.categories.getOrCreate(
        createPodcastInput.categoryName,
        createPodcastInput.categoryImg,
      );
      newPodcast.category = category;
      const { id } = await this.podcastRepository.save(newPodcast);
      return {
        ok: true,
        id,
      };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async myPodcasts(
    creator: User,
    { page }: MyPodcastsInput,
  ): Promise<MyPodcastsOutput> {
    try {
      const [podcasts, totalResults] =
        await this.podcastRepository.findAndCount({
          where: { creator },
          take: 12,
          skip: (page - 1) * 12,
        });

      return {
        ok: true,
        totalResults,
        totalPages: Math.ceil(totalResults / 12),
        podcasts,
      };
    } catch (error) {
      return {
        ok: false,
        error: '팟캐스트를 찾을 수 없습니다',
      };
    }
  }

  async myPodcast(
    creator: User,
    { id }: MyPodcastInput,
  ): Promise<MyPodcastOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(
        { creator, id },
        { relations: ['episodes', 'reviews'] },
      );
      return {
        ok: true,
        podcast,
      };
    } catch (error) {
      return {
        ok: false,
        error: '팟캐스트를 찾을 수 없습니다',
      };
    }
  }

  async allPodcasts({ page }: PodcastsInput): Promise<PodcastsOutput> {
    try {
      const [results, totalResults] =
        await this.podcastRepository.findWithPagination(page, 12);
      return {
        ok: true,
        results,
        totalPages: Math.ceil(totalResults / 12),
        totalResults,
      };
    } catch (error) {
      return {
        ok: false,
        error: '팟캐스트를 불러오지 못했습니다',
      };
    }
  }

  async promotionPodcasts(): Promise<PromotionPodcastsOutput> {
    try {
      const podcasts = await this.podcastRepository.find({
        where: {
          isPromoted: true,
        },
      });
      if (!podcasts) {
        return {
          ok: false,
          error: '프로모션 중인 팟캐스트가 없습니다',
        };
      }
      return {
        ok: true,
        results: podcasts,
      };
    } catch (error) {
      return {
        ok: false,
        error: '프로모션 팟',
      };
    }
  }

  async getPodcast(id: number): Promise<PodcastOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(
        { id },
        { relations: ['episodes', 'creator', 'reviews'] },
      );
      if (!podcast) {
        return {
          ok: false,
          error: `Podcast with id ${id} not found`,
        };
      }
      return {
        ok: true,
        podcast,
      };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async deletePodcast(user: User, id: number): Promise<CoreOutput> {
    try {
      const { ok, error, podcast } = await this.getPodcast(id);
      if (!ok) {
        return { ok, error };
      }
      if (podcast.creator.id !== user.id) {
        return { ok: false, error: 'Not authorized' };
      }
      await this.podcastRepository.delete({ id });
      return { ok };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async updatePodcast(
    user: User,
    { id, payload }: UpdatePodcastInput,
  ): Promise<CoreOutput> {
    try {
      const { ok, error, podcast } = await this.getPodcast(id);
      if (!ok) {
        return { ok, error };
      }
      if (podcast.creator.id !== user.id) {
        return { ok: false, error: 'Not authorized' };
      }
      if (
        payload.rating !== null &&
        (payload.rating < 1 || payload.rating > 5)
      ) {
        return {
          ok: false,
          error: 'Rating must be between 1 and 5.',
        };
      } else {
        const updatedPodcast: Podcast = { ...podcast, ...payload };
        await this.podcastRepository.save(updatedPodcast);
        return { ok };
      }
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async podcastPromotion(
    host: User,
    { id }: PodcastPromotionInput,
  ): Promise<CoreOutput> {
    try {
      const podcast = await this.podcastRepository.findOne({ id });
      if (!podcast) {
        return {
          ok: false,
          error: '팟캐스트를 찾을 수 없습니다',
        };
      }
      podcast.isPromoted = true;
      await this.podcastRepository.save(podcast);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '프로모션을 진행할 수 없습니다',
      };
    }
  }

  async searchPodcasts({
    titleQuery,
    page,
  }: SearchPodcastsInput): Promise<SearchPodcastsOutput> {
    try {
      const [podcasts, totalResults] =
        await this.podcastRepository.findAndCount({
          // where: { title: Raw((title) => `${title} LIKE ${titleQuery}`) },
          where: { title: ILike(`%${titleQuery}%`) },
          take: 12,
          skip: (page - 1) * 12,
        });
      if (!podcasts) {
        return { ok: false, error: '팟캐스트를 찾을 수 없습니다' };
      }
      return {
        ok: true,
        podcasts,
        totalResults,
        totalPages: Math.ceil(totalResults / 12),
      };
    } catch (err) {
      console.log(err);
      return this.InternalServerErrorOutput;
    }
  }

  async getEpisodes(podcastId: number): Promise<EpisodesOutput> {
    const { podcast, ok, error } = await this.getPodcast(podcastId);
    if (!ok) {
      return { ok, error };
    }
    return {
      ok: true,
      episodes: podcast.episodes,
    };
  }

  async getEpisode({
    podcastId,
    episodeId,
  }: GetEpisodeInput): Promise<GetEpisodeOutput> {
    const { episodes, ok, error } = await this.getEpisodes(podcastId);
    if (!ok) {
      return { ok, error };
    }
    const episode = episodes.find(episode => episode.id === episodeId);
    if (!episode) {
      return {
        ok: false,
        error: `Episode with id ${episodeId} not found in podcast with id ${podcastId}`,
      };
    }
    return {
      ok: true,
      episode,
    };
  }

  async createEpisode(
    user: User,
    { podcastId, title }: CreateEpisodeInput,
  ): Promise<CreateEpisodeOutput> {
    try {
      const { podcast, ok, error } = await this.getPodcast(podcastId);
      if (!ok) {
        return { ok, error };
      }
      if (podcast.creator.id !== user.id) {
        return {
          ok: false,
          error: '자신이 만든 팟케스트의 에피소드만 생성할 수 있습니다',
        };
      }
      const newEpisode = this.episodeRepository.create({ title });
      newEpisode.podcast = podcast;
      const { id } = await this.episodeRepository.save(newEpisode);
      return {
        ok: true,
        id,
      };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async deleteEpisode(
    user: User,
    { podcastId, episodeId }: EpisodesSearchInput,
  ): Promise<CoreOutput> {
    try {
      const { episode, error, ok } = await this.getEpisode({
        podcastId,
        episodeId,
      });
      if (!ok) {
        return { ok, error };
      }
      if (episode.podcast.creator.id !== user.id) {
        return {
          ok: false,
          error: '자신이 만든 팟케스트의 에피소드만 삭제할 수 있습니다',
        };
      }
      await this.episodeRepository.delete({ id: episode.id });
      return { ok: true };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async updateEpisode(
    user: User,
    { podcastId, episodeId, ...rest }: UpdateEpisodeInput,
  ): Promise<CoreOutput> {
    try {
      const { episode, ok, error } = await this.getEpisode({
        podcastId,
        episodeId,
      });
      if (!ok) {
        return { ok, error };
      }
      if (episode.podcast.creator.id !== user.id) {
        return {
          ok: false,
          error: '자신이 만든 팟케스트의 에피소드만 수정할 수 있습니다',
        };
      }
      const updatedEpisode = { ...episode, ...rest };
      await this.episodeRepository.save(updatedEpisode);
      return { ok: true };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async createReview(
    reviewer: User,
    { title, text, podcastId }: CreateReviewInput,
  ): Promise<CreateReviewOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(podcastId);
      if (!podcast) {
        return {
          ok: false,
          error: '팟캐스트를 찾을 수 없습니다',
        };
      }

      const review = this.reviewRepository.create({ title, text });
      review.podcast = podcast;
      review.reviewer = reviewer;

      const { id } = await this.reviewRepository.save(review);
      return { ok: true, id };
    } catch {
      return this.InternalServerErrorOutput;
    }
  }

  async deleteReview(
    reviewer: User,
    { id: episodeId, podcastId }: DeleteReviewInput,
  ): Promise<DeleteReviewOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(podcastId);
      if (!podcast) {
        return {
          ok: false,
          error: '팟캐스트를 찾을 수 없습니다',
        };
      }
      const review = await this.reviewRepository.findOne(episodeId, {
        loadRelationIds: true,
      });

      // if (review.reviewer.id !== reviewer.id) {
      //   return {
      //     ok: false,
      //     error: '자신이 작성한 댓글만 삭제할 수 있습니다',
      //   };
      // }

      await this.reviewRepository.delete(episodeId);

      return { ok: true };
    } catch {
      return this.InternalServerErrorOutput;
    }
  }

  countPodcasts(category: Category) {
    return this.podcastRepository.count({ category });
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error: '카테고리를 볼 수 없습니다.',
      };
    }
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: '카테고리를 찾을 수 없습니다',
        };
      }
      const [podcasts, totalResults] =
        await this.podcastRepository.findWithPagination(page, 12, category);
      category.podcasts = podcasts;

      return {
        ok: true,
        category,
        podcasts,
        totalResults,
        totalPages: Math.ceil(totalResults / 12),
      };
    } catch (error) {
      return {
        ok: false,
        error: '카테고리를 불러오지 못했습니다',
      };
    }
  }

  async deleteCategory({ id }: DeleteCategoryInput): Promise<CoreOutput> {
    try {
      const category = await this.categories.findOne({ id });
      if (!category) {
        return {
          ok: false,
          error: '카테고리를 찾을 수 없습니다',
        };
      }
      await this.categories.delete({ id });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '카테고리를 지울 수 없습니다',
      };
    }
  }

  async countSubscriptions({
    id,
  }: CountSubscriptionsInput): Promise<CountSubscriptionsOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(
        { id },
        { loadRelationIds: true },
      );
      if (!podcast) {
        return {
          ok: false,
          error: '팟캐스트를 찾을 수 없습니다',
        };
      }
      const users = podcast.subscriber.length;
      return {
        ok: true,
        users,
      };
    } catch (error) {
      return {
        ok: false,
        error: '구독자를 찾을 수 없습니다',
      };
    }
  }

  async countLikes({ id }: CountLikesInput): Promise<CountLikesOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(
        { id },
        { loadRelationIds: true },
      );
      if (!podcast) {
        return {
          ok: false,
          error: '팟캐스트를 찾을 수 없습니다',
        };
      }
      const users = podcast.liker.length;
      return {
        ok: true,
        users,
      };
    } catch (error) {
      return {
        ok: false,
        error: '사용자를 찾을 수 없습니다',
      };
    }
  }
}
