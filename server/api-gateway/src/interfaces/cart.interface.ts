import { Observable } from 'rxjs';

// Represents a single item in the cart
export interface CartItem {
  productId: number; // Unique product ID
  size: string;      // Product size (e.g., "42", "M", "L")
  quantity: number;  // Quantity of the product
  price: number;     // Price at the time the item was added
  productName?: string
}

// Request to add an item to the cart
export interface AddItemToCartRequest {
  userId: string;    // ID of the user
  item: CartItem;    // Item details to be added
}

// Response after adding an item to the cart
export interface AddItemToCartResponse {
  status: boolean;   // True if the operation succeeded
  message: string;   // Details about the operation
  cartId?: number;   // Cart ID if a new cart was created
}

// Request to remove an item from the cart
export interface RemoveItemFromCartRequest {
  userId: string;    // ID of the user
  productId: number; // ID of the product to remove
  size: string;      // Size of the product to remove
}

// Response after removing an item from the cart
export interface RemoveItemFromCartResponse {
  status: boolean;   // True if the operation succeeded
  message: string;   // Details about the operation
}

// Request to update the quantity of a cart item
export interface UpdateCartItemRequest {
  userId: string;    // ID of the user
  productId: number; // ID of the product to update
  size: string;      // Size of the product to update
  quantity: number;  // New quantity of the product
}

// Response after updating the quantity of a cart item
export interface UpdateCartItemResponse {
  status: boolean;   // True if the operation succeeded
  message: string;   // Details about the operation
}

// Request to retrieve the cart of a user
export interface GetCartRequest {
  userId: string;    // ID of the user
}

// Response after retrieving the cart
export interface GetCartResponse {
  status: boolean;       // True if the operation succeeded
  message: string;       // Details about the operation
  items?: CartItem[];    // List of items in the cart
  totalPrice?: number;   // Total price of all items in the cart
}

// Return enriched response for cart

export interface ExpandedCartItem {
  productId: number; // Unique product ID
  size: string;      // Product size (e.g., "42", "M", "L")
  quantity: number;  // Quantity of the product
  price: number;     // Price at the time the item was added
  brand?: string;
  model?: string;
  productName?: string;
  currency?: string;
  color?: string;
  ImageUrl?: string;
}
export interface GetCartExpandedResponse {
  status: boolean;       // True if the operation succeeded
  message: string;       // Details about the operation
  items?: ExpandedCartItem[];    // List of items in the cart
  totalPrice?: number;   // Total price of all items in the cart
}

// Request to clear all items from the cart
export interface ClearCartRequest {
  userId: string;    // ID of the user
}

// Response after clearing the cart
export interface ClearCartResponse {
  status: boolean;   // True if the operation succeeded
  message: string;   // Details about the operation
}

// Interface for the CartService using RxJS Observables
export interface CartServiceInterface {
  addItem(data: AddItemToCartRequest): Observable<AddItemToCartResponse>;
  removeItem(data: RemoveItemFromCartRequest): Observable<RemoveItemFromCartResponse>;
  updateItem(data: UpdateCartItemRequest): Observable<UpdateCartItemResponse>;
  getCart(data: GetCartRequest): Observable<GetCartResponse>;
  clearCart(data: ClearCartRequest): Observable<ClearCartResponse>;
}
