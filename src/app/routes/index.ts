import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { ownerRoutes } from '../modules/owner/owner.routes';
import { employeeRoutes } from '../modules/employee/employee.routes';
import { adminRoutes } from '../modules/admin/admin.routes';
import { shopRoutes } from '../modules/shop/shop.routes';
import { categoryRoutes } from '../modules/category/category.routes';
import { subcategoryRoutes } from '../modules/subcategory/subcategory.routes';
import { productRoutes } from '../modules/product/product.routes';
import { inventoryRoutes } from '../modules/inventory/inventory.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: userRoutes,
  },
  {
    path: '/admin',
    route: adminRoutes,
  },
  {
    path: '/owner',
    route: ownerRoutes,
  },
  {
    path: '/employee',
    route: employeeRoutes,
  },
  {
    path: '/shop',
    route: shopRoutes,
  },
  {
    path: '/category',
    route: categoryRoutes,
  },
  {
    path: '/subcategory',
    route: subcategoryRoutes,
  },
  {
    path: '/product',
    route: productRoutes,
  },
  {
    path: '/inventory',
    route: inventoryRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
