import express from 'express';
import cors from 'cors';
import { Products } from './firebase.js';
import { doc, getDoc, getDocs, query, orderBy, where, limit as limitDocs, startAfter, updateDoc } from 'firebase/firestore';


const app = express();
app.use(express.json());
app.use(cors());

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
