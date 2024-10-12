import express from 'express';
import cors from 'cors';
import { Products } from './firebase.js';
import { doc, getDoc, getDocs, query, orderBy, where, limit as limitDocs, startAfter, updateDoc } from 'firebase/firestore';
import swaggerUi from 'swagger-ui-express';
import specs from './swaggerOptions.js'; 

const app = express();
app.use(express.json());
app.use(cors());

app.use('/', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     parameters:
 *       - name: category
 *         in: query
 *         required: false
 *         description: Filter products by category
 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         required: false
 *         description: Sort by a specific field
 *         schema:
 *           type: string
 *       - name: order
 *         in: query
 *         required: false
 *         description: Order of sorting (asc/desc)
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of products to return
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of products
 *       500:
 *         description: Server error
 */

app.get('/products', async (req, res) => {
    try {
        const {
            category,
            sortBy = 'price',
            order = 'asc',
            limit: maxLimit = 10,
            page = 1
        } = req.query;

        const limitNum = parseInt(maxLimit);
        const pageNum = parseInt(page);

        let q = Products;

        if (category) {
            q = query(q, where('category', '==', category));
        }

        q = query(q, orderBy(sortBy, order), limitDocs(limitNum));

        if (pageNum > 1) {
            const previousPageQuery = query(
                Products,
                orderBy(sortBy, order),
                limitDocs((pageNum - 1) * limitNum)
            );

            const previousPageSnapshot = await getDocs(previousPageQuery);
            const lastVisible = previousPageSnapshot.docs[previousPageSnapshot.docs.length - 1];

            if (lastVisible) {
                q = query(q, startAfter(lastVisible));
            }
        }

        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.send(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send({ error: 'Failed to fetch products' });
    }
});

/**
 * @swagger
 * /product/{productId}:
 *   get:
 *     summary: Get a product by ID
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: ID of the product to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

app.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const productRef = doc(Products, productId);
        const productSnapshot = await getDoc(productRef);

        if (!productSnapshot.exists()) {
            return res.status(404).send({ error: 'Product not found' });
        }

        res.send({ id: productSnapshot.id, ...productSnapshot.data() });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send({ error: 'Failed to fetch product' });
    }
});
async function updateProductsWithKeywords() {
    const querySnapshot = await getDocs(Products);

    querySnapshot.forEach(async (productDoc) => {
        const productData = productDoc.data();
        const keywords = productData.title.toLowerCase().split(' ');

        const productRef = doc(Products, productDoc.id);
        await updateDoc(productRef, { searchKeywords: keywords });
    });

    console.log('Products updated with search keywords.');
}


/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search for products
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: Search term
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products matching search term
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

app.get('/products/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).send({ error: 'Search term (q) is required' });
        }
        const lowercaseQ = q.toLowerCase();

        const searchQuery = query(
            Products,
            where('searchKeywords', 'array-contains', lowercaseQ)
        );

        const querySnapshot = await getDocs(searchQuery);
        const products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.send(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).send({ error: 'Failed to search products' });
    }
});

/**
 * @swagger
 * /products/filter:
 *   get:
 *     summary: Filter products
 *     parameters:
 *       - name: minPrice
 *         in: query
 *         required: false
 *         description: Minimum price for filtering
 *         schema:
 *           type: number
 *       - name: maxPrice
 *         in: query
 *         required: false
 *         description: Maximum price for filtering
 *         schema:
 *           type: number
 *       - name: brand
 *         in: query
 *         required: false
 *         description: Filter by brand
 *         schema:
 *           type: string
 *       - name: sort
 *         in: query
 *         required: false
 *         description: Sort by price or rating
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filtered list of products
 *       500:
 *         description: Server error
 */

app.get('/products/filter', async (req, res) => {
    try {
        const { minPrice = 0, maxPrice = Infinity, brand, sort = 'price' } = req.query;

        let q = query(
            Products,
            where('price', '>=', parseFloat(minPrice)),
            where('price', '<=', parseFloat(maxPrice))
        );

        if (brand) {
            q = query(q, where('brand', '==', brand.toLowerCase()));
        }

        q = query(q, orderBy(sort));

        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.send(products);
    } catch (error) {
        console.error('Error filtering products:', error);
        res.status(500).send({ error: 'Failed to filter products' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
