/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductSearchController } from './interface/http/controllers/product-search.controller';
import { CreateProductSearchUseCase } from './application/use-cases/create-product-search.use-case';
import { UpdateProductSearchUseCase } from './application/use-cases/update-product-search.use-case';
import { FindOneProductSearchUseCase } from './application/use-cases/find-one-product-search.use-case';

import { ProductSearchService } from './application/services/product-search.service';
import {
  ProductSearch,
  ProductSearchSchema,
} from './infrastructure/framework/mongo/entities/product-search.entity';
import { PRODUCT_SEARCH_REPOSITORY } from './domain/repositories/product-search.repository.port';
import { MongooseProductSearchRepository } from './infrastructure/framework/mongo/mongoose-product-search.repository';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { FindManyProductSearchsUseCase } from './application/use-cases/find-many-product-search.use-case';
import { SyncProductSearchsUseCase } from './application/use-cases/sync-product-search.use-case';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SearchProductUseCase } from './application/use-cases/search-product.use-case';
import { SearchProductWithAIUseCase } from './application/use-cases/search-product-with-ai.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductSearch.name, schema: ProductSearchSchema },
    ]),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => {
        const typeModule = cfg.get<string>('ELASTIC_TYPE_MODULE');
        if (typeModule === 'cloud') {
          const node = cfg.get<string>('ELASTIC_NODE');
          const apiKey = cfg.get<string>('ELASTIC_API_KEY');

          const clientOptions: any = {
            node,
          };

          if (apiKey) {
            clientOptions.auth = { apiKey }; // só adiciona se tiver valor
          }

          return clientOptions;
        } else {
          return {
            node:
              cfg.get<string>('ELASTIC_NODE_LOCAL') || 'http://localhost:9200',
          };
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [ProductSearchController],
  providers: [
    ProductSearchService,
    CreateProductSearchUseCase,
    UpdateProductSearchUseCase,
    FindManyProductSearchsUseCase,
    FindOneProductSearchUseCase,
    SyncProductSearchsUseCase,
    SearchProductUseCase,
    SearchProductWithAIUseCase,
    {
      provide: PRODUCT_SEARCH_REPOSITORY,
      useClass: MongooseProductSearchRepository,
    },
  ],
})
export class ProductSearchModule {}
