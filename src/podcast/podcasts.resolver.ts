import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import { PodcastsService } from './podcasts.service';
import { Podcast } from './entities/podcast.entity';
import {
  CreatePodcastInput,
  CreatePodcastOutput,
} from './dtos/create-podcast.dto';
import { CoreOutput } from './dtos/output.dto';
import {
  PodcastSearchInput,
  PodcastOutput,
  EpisodesOutput,
  EpisodesSearchInput,
  GetAllPodcastsOutput,
} from './dtos/podcast.dto';
import { UpdatePodcastInput } from './dtos/update-podcast.dto';
import { Episode } from './entities/episode.entity';
import { Review } from './entities/review.entity';
import {
  CreateEpisodeInput,
  CreateEpisodeOutput,
} from './dtos/create-episode.dto';
import { UpdateEpisodeInput } from './dtos/update-episode.dto';
import { Role } from 'src/auth/role.decorator';
import {
  SearchPodcastsInput,
  SearchPodcastsOutput,
} from './dtos/search-podcasts.dto';
import {
  CreateReviewOutput,
  CreateReviewInput,
} from './dtos/create-review.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryOutput, CategoryInput } from './dtos/category.dto';
import { MyPodcastsOutput, MyPodcastsInput } from './dtos/my-podcasts.dto';
import { MyPodcastOutput, MyPodcastInput } from './dtos/my-podcast.dto';
import { PodcastsOutput, PodcastsInput } from './dtos/podcasts.dto';
import { PromotionPodcastsOutput } from './dtos/promotion-podcasts.dto';
import { PodcastPromotionInput } from './dtos/podcast-promotion.dto';
import { DeleteCategoryInput } from './dtos/delete-category.dto';
import { CountLikesOutput, CountLikesInput } from './dtos/count-likes.dto';
import { GetEpisodeInput, GetEpisodeOutput } from './dtos/get-episode.dto';
import {
  CreatePromotionImgOutput,
  CreatePromotionImgInput,
} from './dtos/create-promitionimg.dto';
import {
  DeleteReviewOutput,
  DeleteReviewInput,
} from './dtos/delete-review.dto';
import {
  CountSubscriptionsOutput,
  CountSubscriptionsInput,
} from './dtos/count-subscriptions.dto';

@Resolver(of => Podcast)
export class PodcastsResolver {
  constructor(private readonly podcastsService: PodcastsService) {}

  @Query(returns => GetAllPodcastsOutput)
  getAllPodcasts(): Promise<GetAllPodcastsOutput> {
    return this.podcastsService.getAllPodcasts();
  }

  @Mutation(returns => CreatePodcastOutput)
  @Role(['Host'])
  createPodcast(
    @AuthUser() user: User,
    @Args('input') createPodcastInput: CreatePodcastInput,
  ): Promise<CreatePodcastOutput> {
    return this.podcastsService.createPodcast(user, createPodcastInput);
  }

  @Mutation(returns => CreatePromotionImgOutput)
  @Role(['Host'])
  createPromotionImg(
    @AuthUser() user: User,
    @Args('input') createPromotionImgInput: CreatePromotionImgInput,
  ): Promise<CreatePromotionImgOutput> {
    return this.podcastsService.createPromotionImg(
      user,
      createPromotionImgInput,
    );
  }

  @Query(returns => MyPodcastsOutput)
  @Role(['Host'])
  myPodcasts(
    @AuthUser() creator: User,
    @Args('input') myPodcastInput: MyPodcastsInput,
  ): Promise<MyPodcastsOutput> {
    return this.podcastsService.myPodcasts(creator, myPodcastInput);
  }

  @Query(returns => MyPodcastOutput)
  @Role(['Host'])
  myPodcast(
    @AuthUser() creator: User,
    @Args('input') myPodcastInput: MyPodcastInput,
  ): Promise<MyPodcastOutput> {
    return this.podcastsService.myPodcast(creator, myPodcastInput);
  }

  @Mutation(returns => CoreOutput)
  @Role(['Host'])
  deletePodcast(
    @AuthUser() user: User,
    @Args('input') podcastSearchInput: PodcastSearchInput,
  ): Promise<CoreOutput> {
    return this.podcastsService.deletePodcast(user, podcastSearchInput.id);
  }

  @Mutation(returns => CoreOutput)
  @Role(['Host'])
  updatePodcast(
    @AuthUser() user: User,
    @Args('input') updatePodcastInput: UpdatePodcastInput,
  ): Promise<CoreOutput> {
    return this.podcastsService.updatePodcast(user, updatePodcastInput);
  }

  @Mutation(returns => CoreOutput)
  @Role(['Host'])
  togglePromotion(
    @Args('input') podcastPromotionInput: PodcastPromotionInput,
  ): Promise<CoreOutput> {
    return this.podcastsService.podcastPromotion(podcastPromotionInput);
  }

  @Query(returns => PodcastsOutput)
  podcasts(
    @Args('input') podcastsInput: PodcastsInput,
  ): Promise<PodcastsOutput> {
    return this.podcastsService.allPodcasts(podcastsInput);
  }

  @Query(returns => PromotionPodcastsOutput)
  promotionPocasts(): Promise<PodcastsOutput> {
    return this.podcastsService.promotionPodcasts();
  }

  @Query(returns => PodcastOutput)
  getPodcast(
    @Args('input') podcastSearchInput: PodcastSearchInput,
  ): Promise<PodcastOutput> {
    return this.podcastsService.getPodcast(podcastSearchInput.id);
  }

  @Query(returns => SearchPodcastsOutput)
  @Role(['Listener'])
  searchPodcasts(
    @Args('input') searchPodcastsInput: SearchPodcastsInput,
  ): Promise<SearchPodcastsOutput> {
    return this.podcastsService.searchPodcasts(searchPodcastsInput);
  }

  @Role(['Any'])
  @Query(() => CountSubscriptionsOutput)
  countSubscriptions(
    @Args('input') countSubscriptionsInput: CountSubscriptionsInput,
  ): Promise<CountSubscriptionsOutput> {
    return this.podcastsService.countSubscriptions(countSubscriptionsInput);
  }

  @Role(['Any'])
  @Query(() => CountLikesOutput)
  countLikes(
    @Args('input') countLikesInput: CountLikesInput,
  ): Promise<CountLikesOutput> {
    return this.podcastsService.countLikes(countLikesInput);
  }

  @ResolveField(type => Int)
  subscriberCount(@Parent() podcast: Podcast): Promise<number> {
    return this.podcastsService.countSubscriber(podcast);
  }
}

@Resolver(of => Episode)
export class EpisodeResolver {
  constructor(private readonly podcastService: PodcastsService) {}

  @Query(returns => EpisodesOutput)
  getEpisodes(
    @Args('input') podcastSearchInput: PodcastSearchInput,
  ): Promise<EpisodesOutput> {
    return this.podcastService.getEpisodes(podcastSearchInput.id);
  }

  @Query(returns => GetEpisodeOutput)
  getEpisode(
    @Args('input') getEpisodeInput: GetEpisodeInput,
  ): Promise<GetEpisodeOutput> {
    return this.podcastService.getEpisode(getEpisodeInput);
  }

  @Mutation(returns => CreateEpisodeOutput)
  @Role(['Host'])
  createEpisode(
    @AuthUser() user: User,
    @Args('input') createEpisodeInput: CreateEpisodeInput,
  ): Promise<CreateEpisodeOutput> {
    return this.podcastService.createEpisode(user, createEpisodeInput);
  }

  @Mutation(returns => CoreOutput)
  @Role(['Host'])
  updateEpisode(
    @AuthUser() user: User,
    @Args('input') updateEpisodeInput: UpdateEpisodeInput,
  ): Promise<CoreOutput> {
    return this.podcastService.updateEpisode(user, updateEpisodeInput);
  }

  @Mutation(returns => CoreOutput)
  @Role(['Host'])
  deleteEpisode(
    @AuthUser() user: User,
    @Args('input') episodesSearchInput: EpisodesSearchInput,
  ): Promise<CoreOutput> {
    return this.podcastService.deleteEpisode(user, episodesSearchInput);
  }
}

@Resolver(of => Review)
export class ReviewResolver {
  constructor(private readonly podcastService: PodcastsService) {}

  @Mutation(() => CreateReviewOutput)
  @Role(['Listener'])
  createReview(
    @AuthUser() reviewer: User,
    @Args('input') createReviewInput: CreateReviewInput,
  ): Promise<CreateReviewOutput> {
    return this.podcastService.createReview(reviewer, createReviewInput);
  }

  @Mutation(() => DeleteReviewOutput)
  @Role(['Listener'])
  deleteReview(
    @AuthUser() reviewer: User,
    @Args('input') deleteReviewInpt: DeleteReviewInput,
  ): Promise<DeleteReviewOutput> {
    return this.podcastService.deleteReview(reviewer, deleteReviewInpt);
  }
}

@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly podcastService: PodcastsService) {}

  @ResolveField(type => Int)
  podcastCount(@Parent() category: Category): Promise<number> {
    return this.podcastService.countPodcasts(category);
  }

  @Query(type => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.podcastService.allCategories();
  }

  @Query(type => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.podcastService.findCategoryBySlug(categoryInput);
  }

  @Mutation(type => CoreOutput)
  deleteCategory(
    @Args('input') deleteCategoryInput: DeleteCategoryInput,
  ): Promise<CoreOutput> {
    return this.podcastService.deleteCategory(deleteCategoryInput);
  }
}
