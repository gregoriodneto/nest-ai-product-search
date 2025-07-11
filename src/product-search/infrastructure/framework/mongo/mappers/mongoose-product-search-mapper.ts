import { ProductSearch as ProductSearchEntity } from 'src/product-search/domain/entities/product-search.entity';
import { ProductSearch as ProductSearchDocument } from '../entities/product-search.entity';

export class MongooseProductSearchMapper {
  static toDomain(doc: ProductSearchDocument): ProductSearchEntity {
    const entity = new ProductSearchEntity();
    entity.id = doc._id.toString();
    entity.title = doc.title;
    entity.description = doc.description;
    entity.category = doc.category;
    entity.features = doc.features;
    entity.price = doc.price;
    return entity;
  }

  static toMongoose(entity: ProductSearchEntity) {
    const out: any = {
      title: entity.title,
      description: entity.description,
      category: entity.category,
      features: entity.features,
      price: entity.price,
    };
    return out;
  }
}