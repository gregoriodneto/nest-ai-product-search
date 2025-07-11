import { Inject, Injectable } from '@nestjs/common';
import { IProductSearchRepositoryPort, PRODUCT_SEARCH_REPOSITORY } from 'src/product-search/domain/repositories/product-search.repository.port';
import { UpdateProductSearchDto } from 'src/product-search/interface/http/dto/update-product-search.dto';

@Injectable()
export class UpdateProductSearchUseCase {
  constructor(
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly repo: IProductSearchRepositoryPort,
  ) {}

  execute(id: string, dto: UpdateProductSearchDto) {
    return this.repo.update(id, dto);
  }
}