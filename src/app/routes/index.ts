import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { ownerRoutes } from '../modules/owner/owner.routes';
import { employeeRoutes } from '../modules/employee/employee.routes';
import { adminRoutes } from '../modules/admin/admin.routes';

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
