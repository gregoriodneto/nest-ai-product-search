import { CreateProductSearchDto } from 'src/product-search/interface/http/dto/create-product-search.dto';
import { UpdateProductSearchDto } from 'src/product-search/interface/http/dto/update-product-search.dto';
import { ProductSearch } from '../entities/product-search.entity';

export abstract class IProductSearchRepositoryPort {
  abstract findMany(): Promise<ProductSearch[]>;
  abstract create(data: CreateProductSearchDto): Promise<ProductSearch>;
  abstract findOne(query: object): Promise<ProductSearch | null>;
  abstract update(id: string, data: UpdateProductSearchDto): Promise<ProductSearch | null>;
}

export const PRODUCT_SEARCH_REPOSITORY = Symbol('PRODUCT_SEARCH_REPOSITORY');