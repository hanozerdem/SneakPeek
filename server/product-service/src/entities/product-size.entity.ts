import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('ProductSizes')
export class ProductSize {
  @PrimaryGeneratedColumn()
  sizeID: number;

  @Column()
  size: string; // Examples"42", "M", "L"

  @Column()
  quantity: number; // Stock number

  @ManyToOne(() => Product, (product) => product.sizes, { onDelete: 'CASCADE' })
  product: Product;
  
}
