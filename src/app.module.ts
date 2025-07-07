import { Module } from '@nestjs/common';
import { ProductSearchModule } from './product-search/product-search.module';

@Module({
  imports: [ProductSearchModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
