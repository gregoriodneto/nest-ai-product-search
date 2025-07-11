import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CreateProductSearchDto } from '../dto/create-product-search.dto';
import { UpdateProductSearchDto } from '../dto/update-product-search.dto';

import { ProductSearchService } from 'src/product-search/application/services/product-search.service';

@ApiTags('ProductSearch')
@Controller('product-search')
export class ProductSearchController {
  constructor(private readonly productSearchService: ProductSearchService) {}

  /* ────────────────────────────────────────────────
     POST /product-search
  ──────────────────────────────────────────────── */
  @Post()
  @ApiOperation({ summary: 'Criar product-search.' })
  @ApiBody({ type: CreateProductSearchDto })
  @ApiCreatedResponse({ description: 'ProductSearch criado com sucesso' })
  create(@Body() dto: CreateProductSearchDto) {
    return this.productSearchService.create(dto);
  }

  /* ────────────────────────────────────────────────
     GET /product-search
  ──────────────────────────────────────────────── */
  @Get()
  @ApiOperation({ summary: 'Listar product-search.' })
  @ApiOkResponse({ description: 'Lista de product-search.' })
  findAll() {
    return this.productSearchService.findAll();
  }

  /* ────────────────────────────────────────────────
     GET /product-search/:id
  ──────────────────────────────────────────────── */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar product-search por ID.' })
  @ApiParam({ name: 'id', description: 'ID do product-search', type: String })
  @ApiOkResponse({ description: 'ProductSearch encontrado.' })
  findOne(@Param('id') id: string) {
    return this.productSearchService.findOne(id);
  }

  /* ────────────────────────────────────────────────
     PATCH /product-search/:id
  ──────────────────────────────────────────────── */
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar product-search.' })
  @ApiParam({ name: 'id', description: 'ID do product-search', type: String })
  @ApiBody({ type: UpdateProductSearchDto })
  @ApiOkResponse({ description: 'ProductSearch atualizado.' })
  update(@Param('id') id: string, @Body() dto: UpdateProductSearchDto) {
    return this.productSearchService.update(id, dto);
  }

  @Get('sync')
  @ApiOperation({ summary: 'Sincronização do Mongo com o Elasticsearch' })
  async sync() {
    return this.productSearchService.sync();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscando produtos no Elasticsearch' })
  @ApiQuery({ name: 'q', required: true, description: 'Texto para busca (sem IA)' })
  async search(@Query('q') query: string) {
    return this.productSearchService.searchProducts(query);
  }

  @Get('search-ai')
  @ApiOperation({ summary: 'Buscando produtos no Elasticsearch com ajuda da IA' })
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