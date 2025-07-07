import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductSearchService } from './product-search.service';
import { ProductSearchController } from './product-search.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => {
        const node = cfg.get<string>('ELASTIC_NODE');
        const apiKey = cfg.get<string>('ELASTIC_API_KEY');
        const serverMode = cfg.get<string>('ELASTIC_SERVERLESS');

        return {
          node,
          ...(apiKey ? { auth: { apiKey } } : {}),
          ...(serverMode ? { serverMode: 'serverless' } : {})
        }
      },
      inject: [ConfigService],
    })
  ],
  controllers: [ProductSearchController],
  providers: [ProductSearchService],
})
export class ProductSearchModule {}