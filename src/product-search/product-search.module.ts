import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductSearchService } from './product-search.service';
import { ProductSearchController } from './product-search.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseProductsRepository } from './infrastructure/repositories/mongoose-products.repository';
import { Product, ProductSchema } from './infrastructure/entities/products.entity';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      })
    }),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => {
        const typeModule = cfg.get<string>('ELATIC_TYPE_MODULE');

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
            node: cfg.get<string>('ELASTIC_NODE_LOCAL') || 'http://localhost:9200',
          };
        }        
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [ProductSearchController],
  providers: [ProductSearchService, MongooseProductsRepository]
})
export class ProductSearchModule {}