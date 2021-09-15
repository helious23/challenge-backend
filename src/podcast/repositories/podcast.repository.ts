import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Podcast } from '../entities/podcast.entity';

@EntityRepository(Podcast)
export class PodcastRepository extends Repository<Podcast> {
  async findWithPagination(
    page: number,
    itemNumber: number,
    category?: Category,
  ): Promise<[Podcast[], number]> {
    if (category) {
      const [podcasts, totalResults] = await this.findAndCount({
        where: {
          category,
        },
        take: itemNumber,
        skip: (page - 1) * itemNumber,
      });
      return [podcasts, totalResults];
    } else {
      const [podcasts, totalResults] = await this.findAndCount({
        take: itemNumber,
        skip: (page - 1) * itemNumber,
      });
      return [podcasts, totalResults];
    }
  }
}
