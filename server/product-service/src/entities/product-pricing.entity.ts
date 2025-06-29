import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('ProductPricings')
export class ProductPricing {
  @PrimaryGeneratedColumn()
  pricingID: number;

  @Column()
  priceType: string; // "Regular", "Discounted", "Black Friday" 

  @Column('float')
  price: number;

  @Column()
  currency: string;

  @ManyToOne(() => Product, (product) => product.prices, { onDelete: 'CASCADE' })
  product: Product;
}
