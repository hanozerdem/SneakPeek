import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CartItemEntity } from './cartItem.entity';

@Entity({ name: 'Cart' }) 
export class CartEntity {
  @PrimaryGeneratedColumn({ name: 'CartID' }) 
  id: number;

  @Column({ name: 'UserID' }) 
  userId: string;

  @Column({ name: 'CreatedAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true, eager: true })
  items: CartItemEntity[];
}
