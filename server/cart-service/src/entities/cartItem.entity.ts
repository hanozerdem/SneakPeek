import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CartEntity } from './cart.entity';

@Entity({ name: 'Cart_Items' }) 
export class CartItemEntity {
  @PrimaryGeneratedColumn({ name: 'CartItemID' })
  id: number;

  @Column({ name: 'ProductID' })
  productId: number;

  @Column({ name: 'Quantity' })
  quantity: number;

  @Column('double', { name: 'Price' })
  price: number;

  @ManyToOne(() => CartEntity, (cart) => cart.items)
  cart: CartEntity;

  @Column({ name: 'Size' })  
  size: string;
}
