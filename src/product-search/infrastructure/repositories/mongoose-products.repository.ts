import { InjectModel } from "@nestjs/mongoose";
import { Product as ProductMongoose } from "../entities/products.entity";
import { Model } from "mongoose";
import { CreatedProductDTO } from "src/product-search/dto/created-product.dto";

export class MongooseProductsRepository {
    constructor(@InjectModel(ProductMongoose.name) private model: Model<ProductMongoose>) { }

    async create(data: CreatedProductDTO) {
        return await this.model.create(data);
    }

    async getAll(): Promise<ProductMongoose[]> {
        return await this.model.find().lean();
    }
}