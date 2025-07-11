import { Inject, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ProductSearch } from 'src/product-search/domain/entities/product-search.entity';
import { IProductSearchRepositoryPort, PRODUCT_SEARCH_REPOSITORY } from 'src/product-search/domain/repositories/product-search.repository.port';
import { CreateProductSearchDto } from 'src/product-search/interface/http/dto/create-product-search.dto';

@Injectable()
export class CreateProductSearchUseCase {
  constructor(
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly repo: IProductSearchRepositoryPort,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async execute(dto: CreateProductSearchDto) {
    const product = await this.repo.create(dto);
    this.syncProductToElastic(product);
  }

  private async syncProductToElastic(product: ProductSearch) {
    await this.elasticsearchService.index({
      index: 'products',
      id: product.id,
      document: {
        title: product.title,
        description: product.description,
        category: product.category,
        features: product.features,
        price: product.price
      }
    })
  }
}