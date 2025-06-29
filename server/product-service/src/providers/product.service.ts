import {
  Injectable
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/entities/product.entity';
import { ProductSize } from 'src/entities/product-size.entity';
import { ProductPricing } from 'src/entities/product-pricing.entity';
import {
  AddPriceToProductRequest,
  AddPriceToProductResponse,
  AddSizeToProductRequest,
  AddSizeToProductResponse,
  CheckStockBeforeAddingRequest,
  CheckStockBeforeAddingResponse,
  CreateProductRequest,
  CreateProductResponse,
  DecreaseStockAfterPurchaseRequest,
  DecreaseStockAfterPurchaseResponse,
  DeleteProductRequest,
  DeleteProductResponse,
  GetAllProductsResponse,
  GetProductByIdRequest,
  GetProductByIdResponse,
  GetProductStockRequest,
  GetProductStockResponse,
  IsProductAvailableInSizeRequest,
  IsProductAvailableInSizeResponse,
  UpdateProductRequest,
  UpdateProductResponse,
} from 'src/interfaces/product-base.interface';
import { NotFoundException } from '@nestjs/common';

function getStandardPrice(p: Product): number {
  // if there is a price in the product itself
  if (typeof p.price === 'number' && p.price > 0) {
    return p.price;
  }

  // price is not in the product itself, check the prices array
  if (Array.isArray(p.prices)) {
    const std = p.prices.find(
      pr =>
        pr?.priceType?.toLowerCase() === 'standard' &&
        typeof pr.price === 'number' &&
        pr.price > 0,
    );
    if (std) return std.price;
  }

  // there is no standard price
  return 0;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductSize)
    private readonly productSizeRepository: Repository<ProductSize>,
    @InjectRepository(ProductPricing)
    private readonly productPricingRepository: Repository<ProductPricing>,
  ) {}

  async create(
    productData: CreateProductRequest,
  ): Promise<CreateProductResponse> {
    try {
      // Extract sizes and prices from productData
      const { sizes, prices, ...productDetails } = productData;

      // Create Products with given product details
      const newProduct = this.productRepository.create(productDetails);
      const savedProduct = await this.productRepository.save(newProduct);

      // If there are sizes add these size
      // to created product
      if (sizes && sizes.length > 0) {
        for (const sizeData of sizes) {
          // If there are existing sizes
          // update its values
          const existingSize = savedProduct.sizes?.find(
            (s) => s.size === sizeData.size,
          );
          if (existingSize) {
            existingSize.quantity += sizeData.quantity;
            await this.productSizeRepository.save(existingSize);
          } else {
            const newSize = this.productSizeRepository.create({
              ...sizeData,
              product: savedProduct,
            });
            await this.productSizeRepository.save(newSize);
          }
        }
      }

      // Farklı fiyatlandırma bilgileri (indirim, farklı kur) kayıt altına alınıyor
      if (prices && prices.length > 0) {
        for (const pricingData of prices) {
          const newPricing = this.productPricingRepository.create({
            ...pricingData,
            product: savedProduct,
          });
          await this.productPricingRepository.save(newPricing);
        }
      }

      return {
        status: true,
        message: 'Product is created successfully!',
        productId: savedProduct.productID,
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        message: 'Failed to create product: ' + err.message,
        productId: -1,
      };
    }
  }

  async findAll(): Promise<GetAllProductsResponse> {
    try {
      const products = await this.productRepository.find({
        relations: ['sizes', 'prices', 'reviews'],
      });
  
      return {
        status: true,
        message: 'Products fetched successfully!',
        products: products.map((product) => ({
          productId: product.productID,
          productName: product.productName,
          model: product.model,
          brand: product.brand,
          serialNumber: product.serialNumber,
          price: product.price,
          currency: product.currency,
          warrantyStatus: product.warrantyStatus,
          distributor: product.distributor,
          description: product.description,
          color: product.color,
          category: product.category,
          tags: product.tags,
          imageUrl: product.imageUrl,
          sizes: product.sizes.map((size) => ({
            sizeId: size.sizeID,
            size: size.size,
            quantity: size.quantity,
          })),
          prices: product.prices.map((price) => ({
            pricingId: price.pricingID,
            priceType: price.priceType,
            price: price.price,
            currency: price.currency,
          })),
          reviews: product.reviews.map((review) => ({
            reviewId: review.reviewID,
            userId: review.userID,
            reviewText: review.reviewText,
            rating: review.rating,
            createdAt: review.createdAt.toISOString(),
            status: review.status,
          })),
          rating: product.rating,
          sales: product.sales,
          popularity: product.popularity,
          currentPriceType : product.currentPriceType,
        })),
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        message: 'Product not found!',
        products: [],
      };
    }
  }
  
  async getProductById(
    id: GetProductByIdRequest,
  ): Promise<GetProductByIdResponse> {
    try {
      const productId = id.productId;
      const product = await this.productRepository.findOne({
        where: { productID: productId },
        relations: ['sizes', 'prices'], // İlişkili alanları da dahil ettiğinizden emin olun
      });

         if (!product || !(getStandardPrice(product) > 0)) {
           //if the product is not found or the standard price is not greater than 0
           throw new NotFoundException('Product is inactive or not found');
         }

      //mapping the product to the response format
      return {
        status: true,
        message: 'Product fetched successfully!',
        productName: product.productName,
        model: product.model,
        brand: product.brand,
        serialNumber: product.serialNumber,
        price: product.price,
        currency: product.currency,
        warrantyStatus: product.warrantyStatus,
        distributor: product.distributor,
        description: product.description,
        color: product.color,
        category: product.category,
        imageUrl: product.imageUrl,
        tags: product.tags,
        sizes: product.sizes.map((size) => ({
          sizeId: size.sizeID, 
          size: size.size,
          quantity: size.quantity,
        })),
        prices: product.prices.map((pricing) => ({
          pricingId: pricing.pricingID,
          priceType: pricing.priceType,
          price: pricing.price,
          currency: pricing.currency,
        })),
        currentPriceType: product.currentPriceType,
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        message: 'Failed to get product by id!',
      };
    }
  }
  async updateProduct(product: UpdateProductRequest): Promise<UpdateProductResponse> {
    try {
      const { productId, sizes, prices, ...rest } = product;
  
      const existing = await this.productRepository.findOne({
        where: { productID: productId },
        relations: ['sizes', 'prices'],
      });
  
      if (!existing) {
        return { status: false, message: 'Product not found!' };
      }
  
      const updateFields = { ...rest };
  
  
  
      if (Object.keys(updateFields).length > 0) {
        await this.productRepository.update({ productID: productId }, updateFields);
      }
  
      if (sizes) {
        await this.productSizeRepository.delete({ product: { productID: productId } });
        await this.productSizeRepository.save(
          sizes.map(s => this.productSizeRepository.create({
            size: s.size,
            quantity: s.quantity,
            product: { productID: productId },
          })),
        );
      }
  
      if (prices) {
        await this.productPricingRepository.delete({ product: { productID: productId } });
        await this.productPricingRepository.save(
          prices.map(p => this.productPricingRepository.create({
            ...p,
            product: { productID: productId },
          })),
        );
      }
  
      return { status: true, message: 'Product updated successfully!' };
    } catch (err) {
      console.error('Error in updateProduct:', err);
      return { status: false, message: 'An error occurred while trying to update product' };
    }
  }
  

  async deleteProduct(
    productId: DeleteProductRequest,
  ): Promise<DeleteProductResponse> {
    try {
      const id = productId.productId;
      const existingProduct = await this.productRepository.findOne({
        where: { productID: id },
      });

      if (!existingProduct) {
        return {
          status: false,
          message: 'Product not found!',
        };
      }

      await this.productRepository.delete({ productID: id });

      return {
        status: true,
        message: 'Product deleted successfully!',
      };
    } catch (err) {
      console.error(err);
      return {
        status: false,
        message:
          'There was an error while deleting the product: ' + err.message,
      };
    }
  }



  // -------- Stock Functions  ---------

  // GetProductStockRequest ve GetProductStockResponse

  // -> updated getProductStock
  async getProductStock(
    productData: GetProductStockRequest,
  ): Promise<GetProductStockResponse> {
    const product = await this.productRepository.findOne({
      where: { productID: productData.productId },
    });
  
    if (!product) {
      return {
        status: false,
        message: `Product with ID ${productData.productId} not found`,
        stock: 0,
      };
    }
  
    const sizeEntry = await this.productSizeRepository.findOne({
      where: {
        product: { productID: productData.productId },
        size: productData.size,
      },
    });
  
    if (!sizeEntry) {
      return {
        status: false,
        message: `Size '${productData.size}' not found for product ${productData.productId}`,
        stock: 0,
      };
    }
  
    return {
      status: true,
      message: 'Stock retrieved successfully',
      stock: sizeEntry.quantity,
    };
  }
  

  // CheckStockBeforeAddingRequest ve CheckStockBeforeAddingResponse
  async checkStockBeforeAdding(
    productData: CheckStockBeforeAddingRequest,
  ): Promise<CheckStockBeforeAddingResponse> {
    const product = await this.productRepository.findOne({
      where: { productID: productData.productId },
      relations: ['sizes'],
    });
  
    if (!product) {
      return {
        status: false,
        message: `Product with ID ${productData.productId} not found`,
      };
    }
  
    const size = product.sizes.find((s) => s.size === productData.size);
  
    if (!size) {
      return {
        status: false,
        message: `Size "${productData.size}" not found for this product`,
      };
    }
  
    if (size.quantity < productData.quantity) {
      return {
        status: false,
        message: `Only ${size.quantity} items available in size "${productData.size}"`,
      };
    }
  
    return {
      status: true,
      message: 'Sufficient stock available for the requested size',
    };
  }
  

  // DecreaseStockAfterPurchaseRequest ve DecreaseStockAfterPurchaseResponse
    // -> this one

    async decreaseStockAfterPurchase(
      productData: DecreaseStockAfterPurchaseRequest,
    ): Promise<DecreaseStockAfterPurchaseResponse> {
      const product = await this.productRepository.findOne({
        where: { productID: productData.productId },
        relations: ['reviews'], // ÖNEMLİ: reviews eklenmezse popularity hatalı olur
      });
    
      if (!product) {
        return {
          status: false,
          message: `Product with ID ${productData.productId} not found`,
          size: productData.size,
        };
      }
    
      const sizeEntry = await this.productSizeRepository.findOne({
        where: {
          product: { productID: productData.productId },
          size: productData.size,
        },
      });
    
      if (!sizeEntry) {
        return {
          status: false,
          message: `Size '${productData.size}' not found for product ${productData.productId}`,
          size: productData.size,
        };
      }
    
      if (sizeEntry.quantity < productData.quantity) {
        return {
          status: false,
          message: 'Not enough stock to fulfill the purchase',
          size: productData.size,
        };
      }
    
      sizeEntry.quantity -= productData.quantity;
      await this.productSizeRepository.save(sizeEntry);
    
      // SALES + POPULARITY güncelle
      product.sales = (product.sales || 0) + productData.quantity;
    
      const reviewCount = product.reviews?.length ?? 0;
      const rating = product.rating ?? 0;
      const popularityScore = product.sales * 3 + reviewCount * 2 + rating * 5;
      product.popularity = popularityScore;
    
      await this.productRepository.save(product);
    
      return {
        status: true,
        message: 'Stock decreased successfully',
        size: productData.size,
      };
    }
    
    

  // -------- Size and Price ---------

  async addSizeToProduct(
    productData: AddSizeToProductRequest,
  ): Promise<AddSizeToProductResponse> {
    const productId = productData.productId;
    const sizeData = {
      size: productData.size,
      quantity: productData.quantity,
    };
    const product = await this.productRepository.findOne({
      where: { productID: productId },
      relations: ['sizes'],
    });

    if (!product) {
      return {
        status: false,
        message: `Product with ID ${productId} not found`,
        newTotalStock: 0,
      };
    }

    // If there is an existing size then update
    const existingSize = product.sizes.find((s) => s.size === sizeData.size);
    if (existingSize) {
      existingSize.quantity += sizeData.quantity;
      await this.productSizeRepository.save(existingSize);
    } else {
      const newSize = this.productSizeRepository.create({
        ...sizeData,
        product: product,
      });
      await this.productSizeRepository.save(newSize);
    }

    // Calculate the new quantity
    const updatedProduct = await this.productRepository.findOne({
      where: { productID: productId },
      relations: ['sizes'],
    });

    if (!updatedProduct || !updatedProduct.totalStock) {
      return {
        status: false,
        message: 'There is an problem occured during update size in product!',
        newTotalStock: 0,
      };
    }

    return {
      status: true,
      message: 'Size added/updated successfully!',
      newTotalStock: updatedProduct?.totalStock,
    };
  }

  // Add new price to Product
  async addPriceToProduct(
    productData: AddPriceToProductRequest,
  ): Promise<AddPriceToProductResponse> {
    const priceData = {
      priceType: productData.priceType,
      price: productData.price,
      currency: productData.currency,
    };

    const product = await this.productRepository.findOne({
      where: { productID: productData.productId },
    });

    if (!product) {
      return {
        status: false,
        message: `Product with ID ${productData.productId} not found`,
      };
    }

    const newPrice = this.productPricingRepository.create({
      ...priceData,
      product: product,
    });
    await this.productPricingRepository.save(newPrice);

    return { status: true, message: 'Price added successfully!' };
  }

  // If there is an existing product with given ID and size
  async isProductAvailableInSize(
    productData: IsProductAvailableInSizeRequest,
  ): Promise<IsProductAvailableInSizeResponse> {
    const product = await this.productRepository.findOne({
      where: { productID: productData.productId },
      relations: ['sizes'],
    });
    if (!product) {
      return {
        status: false,
        available: false,
        message: `Product with ID ${productData.productId} not found`,
      };
    }
    const foundSize = product.sizes.find(
      (s) => s.size === productData.size && s.quantity > 0,
    );
    if (foundSize) {
      return {
        status: true,
        available: true,
        message: 'Product is available in the requested size',
      };
    } else {
      return {
        status: true,
        available: false,
        message: 'Product is not available in the requested size',
      };
    }
  }
}
