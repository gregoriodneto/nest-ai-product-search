export class ProductSearch {
  id?: string;
  title: string;
  description: string;
  category: string;
  features: string[];
  price: number;

  constructor(props?: Partial<ProductSearch>) {
    Object.assign(this, props);
  }
}
