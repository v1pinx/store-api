import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
import firebaseConfig from './config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Products = collection(db, 'products');

export { Products };
