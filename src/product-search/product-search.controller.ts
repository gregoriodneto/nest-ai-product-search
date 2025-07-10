import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { ProductSearchService } from './product-search.service';
import { ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreatedProductDTO } from './dto/created-product.dto';

@Controller('products')
@ApiTags('Products Search')
export class ProductSearchController {
  constructor(private readonly productSearchService: ProductSearchService) {}

  @Post('created')
  @ApiProperty({ description: 'Criando produto no Elasticsearch para testes' })
  async created(@Body() dto: CreatedProductDTO) {
    return await this.productSearchService.created(dto);
  }

  @Get('sync')
  @ApiProperty({ description: 'Sincronização do Mongo com o Elasticsearch' })
  async sync() {
    return this.productSearchService.sync();
  }

  @Get('search')
  @ApiQuery({ name: 'q', required: true, description: 'Texto para busca (sem IA)' })
  async search(@Query('q') query: string) {
    return this.productSearchService.searchProducts(query);
  }

  @Get('search-ai')
  @ApiQuery({ name: 'q', required: true, description: 'Texto para busca usando IA' })
  async searchAi(@Query('q') query: string) {
    try {
      return this.productSearchService.searchProductsWithAi(query);
    } catch (error) {
      throw new HttpException(
        'O serviço de IA está temporariamente indisponível. Por favor, tente novamente mais tarde.', 
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}