import { Inject, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ProductSearch } from 'src/product-search/domain/entities/product-search.entity';
import {
  IProductSearchRepositoryPort,
  PRODUCT_SEARCH_REPOSITORY,
} from 'src/product-search/domain/repositories/product-search.repository.port';

@Injectable()
export class SyncProductSearchsUseCase {
  constructor(
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly repo: IProductSearchRepositoryPort,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async execute(): Promise<void> {
    let lastId: string | undefined;
    const batchSize = 1000;

    while (true) {
      const products = await this.repo.findMany(lastId, batchSize);
      if (products.length === 0) break;

      await this.syncProductToElastic(products);
      lastId = products[products.length - 1].id;
    }
  }

  private async syncProductToElastic(products: ProductSearch[]) {
    const body = products.flatMap((product) => [
      { index: { _index: 'products', _id: product.id } },
      {
        title: product.title,
        description: product.description,
        category: product.category,
        features: product.features,
        price: product.price,
      },
    ]);

    await this.elasticsearchService.bulk({ body });
  }
}
