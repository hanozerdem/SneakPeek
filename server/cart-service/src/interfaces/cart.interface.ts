import { Observable } from 'rxjs';

// Represents a single item in the cart
export interface CartItem {
  productId: number; // Unique ID of the product
  size: string;      // Size of the product (e.g., "42", "M", "L")
  quantity: number;  // Number of items added
  price: number;     // Price of the item at the time of adding
  productName?: string
}

// Request to add an item to the cart
export interface AddItemToCartRequest {
  userId: string;    // ID of the user
  item: CartItem;    // Details of the item to add
}

// Response after adding an item to the cart
export interface AddItemToCartResponse {
  status: boolean;   // True if the operation was successful
  message: string;   // Description of the result
  cartId?: number;   // ID of the created cart (if newly created)
}

// Request to remove an item from the cart
export interface RemoveItemFromCartRequest {
  userId: string;    // ID of the user
  productId: number; // ID of the product to remove
  size: string;      // Size of the product to remove
}

// Response after removing an item from the cart
export interface RemoveItemFromCartResponse {
  status: boolean;   // True if the operation was successful
  message: string;   // Description of the result
}

// Request to update the quantity of an item in the cart
export interface UpdateCartItemRequest {
  userId: string;    // ID of the user
  productId: number; // ID of the product to update
  size: string;      // Size of the product to update
  quantity: number;  // New quantity value
}

// Response after updating an item in the cart
export interface UpdateCartItemResponse {
  status: boolean;   // True if the operation was successful
  message: string;   // Description of the result
}

// Request to retrieve the user's cart
export interface GetCartRequest {
  userId: string;    // ID of the user
}

// Response after retrieving the user's cart
export interface GetCartResponse {
  status: boolean;       // True if the operation was successful
  message: string;       // Description of the result
  items?: CartItem[];    // Items currently in the cart
  totalPrice?: number;   // Total price of all items
}

// Request to clear the user's cart
export interface ClearCartRequest {
  userId: string;    // ID of the user
}

// Response after clearing the user's cart
export interface ClearCartResponse {
  status: boolean;   // True if the operation was successful
  message: string;   // Description of the result
}

// Interface for CartService, returning RxJS Observables for all operations
export interface CartServiceInterface {
  addItem(data: AddItemToCartRequest): Observable<AddItemToCartResponse>;
  removeItem(data: RemoveItemFromCartRequest): Observable<RemoveItemFromCartResponse>;
  updateItem(data: UpdateCartItemRequest): Observable<UpdateCartItemResponse>;
  getCart(data: GetCartRequest): Observable<GetCartResponse>;
  clearCart(data: ClearCartRequest): Observable<ClearCartResponse>;
}
