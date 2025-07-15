import { Injectable } from '@nestjs/common';
import { CreateProductSearchUseCase } from 'src/product-search/application/use-cases/create-product-search.use-case';
import { UpdateProductSearchUseCase } from 'src/product-search/application/use-cases/update-product-search.use-case';
import { FindOneProductSearchUseCase } from 'src/product-search/application/use-cases/find-one-product-search.use-case';

import { CreateProductSearchDto } from 'src/product-search/interface/http/dto/create-product-search.dto';
import { UpdateProductSearchDto } from 'src/product-search/interface/http/dto/update-product-search.dto';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { FindManyProductSearchsUseCase } from '../use-cases/find-many-product-search.use-case';
import { QueryDslQueryContainer, SortCombinations } from '@elastic/elasticsearch/lib/api/types';
import axios from 'axios';
import { SyncProductSearchsUseCase } from '../use-cases/sync-product-search.use-case';
import { SearchProductUseCase } from '../use-cases/search-product.use-case';
import { SearchProductWithAIUseCase } from '../use-cases/search-product-with-ai.use-case';

@Injectable()
export class ProductSearchService {
  constructor(
    private readonly createProductSearchUC:   CreateProductSearchUseCase,
    private readonly updateProductSearchUC:   UpdateProductSearchUseCase,
    private readonly findManyProductSearchsUC: FindManyProductSearchsUseCase,
    private readonly findOneProductSearchUC:   FindOneProductSearchUseCase,
    private readonly syncProductSearchUC: SyncProductSearchsUseCase,
    private readonly searchProductUC: SearchProductUseCase,
    private readonly searchProductAIUC: SearchProductWithAIUseCase
  ) {}

  async create(dto: CreateProductSearchDto) {
    return this.createProductSearchUC.execute(dto);
  }

  async update(id: string, dto: UpdateProductSearchDto) {
    return this.updateProductSearchUC.execute(id, dto);
  }

  async findAll() {
    return this.findManyProductSearchsUC.execute();
  }

  async findOne(id: string) {
    return this.findOneProductSearchUC.execute({ _id: id });
  }

  async sync() {
    await this.syncProductSearchUC.execute();
    return "Sync realizado com sucesso!"
  }

  async searchProducts(query: string) {
    return await this.searchProductUC.execute(query);
  }

  async searchProductsWithAi(query: string) {
    return await this.searchProductAIUC.execute(query);
  }
}