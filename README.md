# **SneakPeek – E-Commerce Platform**

**SneakPeek** is a full-stack e-commerce platform built using microservice architecture.

---

## **Technologies Used**

- **Frontend**: Next.js 13 (App Router), Tailwind CSS  
- **Backend**: NestJS, gRPC  
- **Databases**:
  - **MySQL** (for structured data: products, cart, etc.)
  - **MongoDB** (for user and order data)
- **Streaming & Messaging**: Apache Kafka  
- **DevOps**: Docker, Docker Compose

---

## **Requirements**

Before running the project, make sure the following are installed:

- **Node.js**
- **npm**
- **Docker & Docker Compose**

---

## **Installation**

### **Backend Setup**

```bash
cd server

cd api-gateway && npm i && cd ..
cd cart-service && npm i && cd ..
cd notification-service && npm i && cd ..
cd order-service && npm i && cd ..
cd payment-service && npm i && cd ..
cd product-service && npm i && cd ..
cd user-service && npm i && cd ..
```

### **Frontend Setup**

```bash
cd ../client
npm i
```

---

## **Running the Project**

### **Start Backend (via Docker)**

```bash
cd server
docker-compose up --build
docker-compose down // -> if stop the docker you have to down it because kafka use the same host so please down it to restart
```

### **Start Frontend**

```bash
cd ../client
npm run dev
```

---
