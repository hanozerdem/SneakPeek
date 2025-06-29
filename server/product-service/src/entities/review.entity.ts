import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './/product.entity';
import { ReviewStatus } from '../interfaces/product-review.interface';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  reviewID: number;

  @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE' })
  product: Product;

    @Column()
    userID: string; 
  @Column({ type: 'text', nullable: true })
  reviewText?: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
