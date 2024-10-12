

# 🛒 Store API ( In Development ) 

A sleek and efficient product management API built using **Express.js** and **Firebase Firestore** for product data management, including filtering, searching, and pagination. This API is perfect for e-commerce platforms, providing powerful querying capabilities with clean and well-structured endpoints.

## 🚀 Features

- **Get Products:** Fetch products with pagination, sorting, and filtering options.
- **Search Products:** Search for products by title with real-time keyword search.
- **Filter Products:** Filter products by price range and brand.
- **Single Product:** Get detailed information about a specific product.

## 📚 Endpoints

### 1. Get Products
Retrieve a list of products with optional pagination, sorting, and filtering.

```bash
GET /products?category=<category>&sortBy=<field>&order=<asc|desc>&limit=<number>&page=<number>
```

### 2. Get Single Product
Fetch detailed information about a specific product.

```bash
GET /product/:productId
```

### 3. Search Products
Search for products by title.

```bash
GET /products/search?q=<search-term>
```

### 4. Filter Products
Filter products by price and brand.

```bash
GET /products/filter?minPrice=<min>&maxPrice=<max>&brand=<brand>
```

## 🛠️ Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/v1pinx/store-api.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

## 🔑 Environment Variables

Ensure to set up your Firebase credentials in a `.env` file.

```bash
apiKey=your_firebase_api_key
authDomain=your_firebase_auth_domain
projectId=your_firebase_project_id
storageBucket=your_firebase_storage_bucket
messagingSenderId=your_firebase_messaging_sender_id
appId=your_firebase_app_id
measurementId=your_firebase_measurement_id
```

## 📝 License

This project is licensed under the MIT License.