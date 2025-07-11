import { Inject, Injectable } from '@nestjs/common';
import { ProductSearch } from 'src/product-search/domain/entities/product-search.entity';
import { IProductSearchRepositoryPort, PRODUCT_SEARCH_REPOSITORY } from 'src/product-search/domain/repositories/product-search.repository.port';

@Injectable()
export class FindOneProductSearchUseCase {
  constructor(
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly repo: IProductSearchRepositoryPort,
  ) {}

  execute(query: object): Promise<ProductSearch | null> {
    return this.repo.findOne(query);
  }
}