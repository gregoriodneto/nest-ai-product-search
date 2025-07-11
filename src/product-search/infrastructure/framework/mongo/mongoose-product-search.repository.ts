import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { ProductSearch } from 'src/product-search/domain/entities/product-search.entity';
import { CreateProductSearchDto } from 'src/product-search/interface/http/dto/create-product-search.dto';

import { ProductSearch as ProductSearchMongoose } from './entities/product-search.entity';
import { MongooseProductSearchMapper } from './mappers/mongoose-product-search-mapper';
import { UpdateProductSearchDto } from 'src/product-search/interface/http/dto/update-product-search.dto';
import { IProductSearchRepositoryPort } from 'src/product-search/domain/repositories/product-search.repository.port';

@Injectable()
export class MongooseProductSearchRepository implements IProductSearchRepositoryPort {
  constructor(
    @InjectModel(ProductSearchMongoose.name)
    private readonly model: Model<ProductSearchMongoose>
  ) {}

  async findMany(): Promise<ProductSearch[]> {
    const docs = await this.model.find();
    return docs.map(MongooseProductSearchMapper.toDomain);
  }

  async create(data: CreateProductSearchDto): Promise<ProductSearch> {
    const doc = await this.model.create(data);
    return MongooseProductSearchMapper.toDomain(doc);
  }

  async findOne(query: object): Promise<ProductSearch | null> {
    const doc = await this.model.findOne(query).exec();
    return doc ? MongooseProductSearchMapper.toDomain(doc) : null;
  }

  async update(id: string, data: UpdateProductSearchDto): Promise<ProductSearch | null> {
    const updated = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    return updated ? MongooseProductSearchMapper.toDomain(updated) : null;
  }
}