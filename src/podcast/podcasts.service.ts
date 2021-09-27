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
  CreatePromotionImgInput,
  CreatePromotionImgOutput,
} from './dtos/create-promitionimg.dto';
import {
  DeleteReviewInput,
  DeleteReviewOutput,
} from './dtos/delete-review.dto';
import {
  CountSubscriptionsInput,
  CountSubscriptionsOutput,
} from './dtos/count-subscriptions.dto';
import { getConnection } from 'typeorm';

@Injectable()
export class PodcastsService {
  constructor(
    private readonly podcastRepository: PodcastRepository,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly categories: CategoryRepository,
    @InjectRepository(User)
    private readonly users: Repository<User>,
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

  async createPromotionImg(
    creator: User,
    { id, promotionImage }: CreatePromotionImgInput,
  ): Promise<CreatePromotionImgOutput> {
    try {
      const podcast = await this.podcastRepository.findOne({ id });
      if (podcast.creatorId !== creator.id) {
        return {
          ok: false,
          error: '자신이 등록한 팟캐스트에만 등록가능합니다',
        };
      }
      podcast.promotionImg = promotionImage;
      podcast.isPromoted = true;
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '프로모션 이미지를 만들수 없습니다',
      };
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
        error: '프로모션 중인 팟캐스트를 불러올 수 없습니다',
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
      console.log(e);
      return this.InternalServerErrorOutput;
    }
  }

  async deletePodcast(cretor: User, id: number): Promise<CoreOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(id, {
        relations: ['subscriber', 'liker'],
      });

      podcast.subscriber.map(async user => {
        user.subscriptions = user.subscriptions.filter(
          subPod => subPod.id !== podcast.id,
        );
        await this.users.save(user);
        return null;
      });
      await this.podcastRepository.save(podcast);

      podcast.liker.map(async user => {
        user.likes = user.likes.filter(likePod => likePod.id !== podcast.id);
        await this.users.save(user);
        return null;
      });
      await this.podcastRepository.save(podcast);

      if (!podcast) {
        return {
          ok: false,
          error: '팟캐스트를 찾을 수 없습니다',
        };
      }

      if (podcast.creatorId !== cretor.id) {
        return { ok: false, error: 'Not authorized' };
      }

      await this.podcastRepository.remove(podcast);
      return {
        ok: true,
      };
    } catch (e) {
      console.log(e);
      return this.InternalServerErrorOutput;
    }
  }

  async updatePodcast(
    user: User,
    updatePodcastInput: UpdatePodcastInput,
  ): Promise<CoreOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(
        updatePodcastInput.id,
      );
      if (!podcast) {
        return {
          ok: false,
          error: '팟캐스트를 찾을 수 없습니다',
        };
      }
      if (podcast.creatorId !== user.id) {
        return {
          ok: false,
          error: '자신이 등록한 팟캐스트만 수정할 수 있습니다',
        };
      }
      await this.podcastRepository.save([
        {
          id: updatePodcastInput.id,
          ...updatePodcastInput,
        },
      ]);
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: '팟캐스트를 수정할 수 없습니다',
      };
    }
  }

  async podcastPromotion({ id }: PodcastPromotionInput): Promise<CoreOutput> {
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
    createEpisodeInput: CreateEpisodeInput,
  ): Promise<CreateEpisodeOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(
        createEpisodeInput.podcastId,
      );
      if (!podcast) {
        return {
          ok: false,
          error: '팟캐스트를 찾지 못했습니다',
        };
      }
      if (user.id !== podcast.creatorId) {
        return {
          ok: false,
          error: '자신이 등록한 팟캐스트의 에피소드만 만들수 있습니다',
        };
      }
      const { id } = await this.episodeRepository.save(
        this.episodeRepository.create({ ...createEpisodeInput, podcast }),
      );
      return {
        ok: true,
        id,
      };
    } catch (error) {
      return {
        ok: false,
        error: '에피소드를 만들지 못했습니다',
      };
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
      if (episode.podcast.creatorId !== user.id) {
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
    updateEpisodeInput: UpdateEpisodeInput,
  ): Promise<CoreOutput> {
    try {
      const episode = await this.episodeRepository.findOne(
        updateEpisodeInput.episodeId,
        {
          relations: ['podcast'],
        },
      );
      if (!episode) {
        return {
          ok: false,
          error: '메뉴를 찾을 수 없습니다.',
        };
      }
      if (episode.podcast.creatorId !== user.id) {
        return {
          ok: false,
          error: '자신이 등록한 식당의 메뉴만 수정할 수 있습니다',
        };
      }
      await this.episodeRepository.save([
        {
          id: updateEpisodeInput.episodeId,
          ...updateEpisodeInput,
        },
      ]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '에피소드를 수정하지 못했습니다',
      };
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
      console.log(review);
      const { id } = await this.reviewRepository.save(review);
      return { ok: true, id };
    } catch {
      return this.InternalServerErrorOutput;
    }
  }

  async deleteReview(
    user: User,
    { id: reviewId }: DeleteReviewInput,
  ): Promise<DeleteReviewOutput> {
    try {
      const review = await this.reviewRepository.findOne(reviewId, {
        loadRelationIds: true,
      });

      if (review.reviewerId !== user.id) {
        return {
          ok: false,
          error: '자신이 작성한 댓글만 삭제할 수 있습니다',
        };
      }

      await this.reviewRepository.delete(reviewId);

      return { ok: true, id: reviewId };
    } catch {
      return this.InternalServerErrorOutput;
    }
  }

  countPodcasts(category: Category) {
    return this.podcastRepository.count({ category: category });
  }

  countSubscriber(podcast: Podcast) {
    return this.users.count({ where: { subscriptions: podcast } });
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
