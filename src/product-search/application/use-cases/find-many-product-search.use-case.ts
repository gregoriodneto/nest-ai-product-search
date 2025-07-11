import { Inject, Injectable } from '@nestjs/common';
import { ProductSearch } from 'src/product-search/domain/entities/product-search.entity';
import { IProductSearchRepositoryPort, PRODUCT_SEARCH_REPOSITORY } from 'src/product-search/domain/repositories/product-search.repository.port';

@Injectable()
export class FindManyProductSearchsUseCase {
  constructor(
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly repo: IProductSearchRepositoryPort,
  ) {}

  execute(): Promise<ProductSearch[]> {
    return this.repo.findMany();
  }
}