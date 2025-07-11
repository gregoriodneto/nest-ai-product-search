import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ProductSearchDocument = ProductSearch & Document;

@Schema({ timestamps: true })
export class ProductSearch {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  category: string;

  @Prop()
  features: string[];

  @Prop()
  price: number;
    
}

export const ProductSearchSchema = SchemaFactory.createForClass(ProductSearch);