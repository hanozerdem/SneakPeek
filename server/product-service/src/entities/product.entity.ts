import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProductSize } from './product-size.entity';
import { ProductPricing } from './product-pricing.entity';
import { Review } from './review.entity';


@Entity('Products')
export class Product {
  @PrimaryGeneratedColumn()
  productID: number;

  @Column()
  productName: string;

  @Column()
  model: string;

  @Column()
  brand: string;

  @Column({ unique: true }) 
  serialNumber: string;

  @Column('float')
  price: number;

  @Column()
  currency: string;

  @Column()
  warrantyStatus: string;

  @Column()
  distributor: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  category?: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @OneToMany(() => ProductSize, (size) => size.product)
  sizes: ProductSize[];

  @OneToMany(() => ProductPricing, (pricing) => pricing.product)
  prices: ProductPricing[];

  @OneToMany(() => Review, (review) => review.product, { cascade: true })
  reviews: Review[];

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column()
  imageUrl: string;
  
  get totalStock(): number {
    return this.sizes?.reduce((total, size) => total + size.quantity, 0) || 0;
  }

  @Column({ default: 0 }) popularity: number; 
  @Column({ default: 0 }) sales: number;
  
  @Column({ type: 'varchar', default: 'standard' })
  currentPriceType: string;
  
}


