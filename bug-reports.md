# Cart Service Backend

---

### **BUG-CART-001: Insufficient Validation for Cart Item Prices**

> **As a user**, I want proper validation of cart item prices, so that my cart total calculation remains correct and reliable.

- **Description:**  
  Cart service allows invalid price values (`NaN`, negative, or extreme values), causing incorrect total calculation, UI breaks, and potential exploitation.

- **Steps to Reproduce:**
  - Add cart item with `price = NaN`
  - Add cart item with negative price (e.g., `-99`)
  - Call `getCart(userId)`
  - Observe incorrect `totalPrice` values (`NaN` or negative)

- **Expected Result:**  
  System rejects invalid price inputs and returns a validation error (e.g., `"Invalid price"`). `totalPrice` calculation remains stable (`0` if no valid items).

- **Actual Result:**  
  Invalid items are added, and `totalPrice` becomes `NaN` or negative, breaking cart functionality.

- **Severity:** High  
- **Priority:** High  
- **Status:** Open

---

# Product Service Backend

---

### **BUG-PRODUCT-001: Missing Validation for Product Creation and Updates**

> **As a store admin**, I need robust product validation, so that customers have accurate, reliable, and meaningful product listings.

- **Description:**  
  Product creation and update operations lack validation for essential fields:
  - Missing `productName`
  - Negative prices (`-50`)
  - Unrealistically large prices (`9999999999999`)
  - Negative size quantities (`-5`)

- **Steps to Reproduce:**
  - Call `create()` without `productName`
  - Call `create()` with negative price
  - Call `updateProduct()` with extremely large price
  - Call `addSizeToProduct()` with negative quantity
  - Observe backend accepts invalid inputs without errors

- **Expected Result:**  
  Each invalid operation should return a clear validation error, such as:
  - `"Product name is required"`
  - `"Invalid price"`
  - `"Invalid quantity"`

- **Actual Result:**  
  Invalid data is accepted, leading to corrupted data, incorrect stock counts, or absurd product prices.

- **Severity:** High  
- **Priority:** High  
- **Status:** Open

---

### **BUG-PRODUCT-002: Missing Fields Cause `.map()` Runtime Error**

> **As a developer**, I want robust handling for incomplete product data, so that frontend pages do not crash unexpectedly.

- **Description:**  
  If a product lacks certain fields (`sizes`, `prices`, or `reviews`), calling `.map()` crashes the service.

- **Steps to Reproduce:**
  - Call `findAll()` with a product missing fields like `sizes`
  - Observe service throws runtime error: `"Cannot read property 'map' of undefined"`

- **Expected Result:**  
  Service gracefully handles missing fields by defaulting them to empty arrays (`[]`).

- **Actual Result:**  
  Runtime error occurs, causing service crash.

- **Severity:** Medium  
- **Priority:** Medium  
- **Status:** Open

---

# Order Service Backend

---

### **BUG-ORDER-001: Missing Validation and Error Handling in Order Creation**

> **As a customer**, I expect proper validation and clear error handling during order creation, ensuring a reliable ordering process.

- **Description:**  
  The order creation flow lacks proper validation and error handling:
  - Orders with a total price of `0` are not properly rejected.
  - Orders with an empty `items` array are not validated.
  - Database errors during `save()` are not handled gracefully.

- **Steps to Reproduce:**
  - Call `createOrder()` with items priced `0` or an empty `items` array.
  - Simulate DB error on `order.save()`.
  - Observe internal errors or unclear responses.

- **Expected Result:**  
  Clear validation errors returned to the client, such as:
  - `"Total price cannot be zero"`
  - `"Order must contain at least one item"`
  - `"Failed to save order to database"`

- **Actual Result:**  
  Internal runtime errors (`orderModel is not a constructor`) occur with no meaningful feedback.

- **Severity:** High  
- **Priority:** High  
- **Status:** Open

---

### **BUG-ORDER-002: Kafka Event Not Emitted After Successful Order**

> **As a developer**, I expect a Kafka event to be emitted after successful order creation, ensuring other services are notified properly.

- **Description:**  
  After successful order creation, Kafka event `payment-approved` fails to emit due to internal errors.

- **Steps to Reproduce:**
  - Successfully call `createOrder()` with valid data.
  - Check Kafka for `payment-approved` event emission.

- **Expected Result:**  
  Kafka event is successfully emitted after order creation.

- **Actual Result:**  
  Kafka event is not emitted; backend throws internal errors.

- **Severity:** Medium  
- **Priority:** High  
- **Status:** Open

---  
