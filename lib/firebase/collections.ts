import { collection, CollectionReference } from 'firebase/firestore';
import { db } from './config';
import type {
  Product,
  Category,
  Company,
  User,
  Order,
  Agent,
  Route,
  Lead,
} from './schema';

// Type-safe collection references
export const productsRef = collection(db, 'products') as CollectionReference<Product>;
export const categoriesRef = collection(db, 'categories') as CollectionReference<Category>;
export const companiesRef = collection(db, 'companies') as CollectionReference<Company>;
export const usersRef = collection(db, 'users') as CollectionReference<User>;
export const ordersRef = collection(db, 'orders') as CollectionReference<Order>;
export const agentsRef = collection(db, 'agents') as CollectionReference<Agent>;
export const routesRef = collection(db, 'routes') as CollectionReference<Route>;
export const leadsRef = collection(db, 'leads') as CollectionReference<Lead>;
