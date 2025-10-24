import {Router} from "express";
import {createUser, deleteUser, getUsers, updateUser} from "../controllers/user.controller";
import * as mwAuth from "../middleware/auth.middleware";
import * as mwRole from "../middleware/role.middleware";

const userRoutes = Router();

userRoutes.post('/', mwAuth.auth, mwRole.admin, createUser);
userRoutes.get('/', mwAuth.auth, getUsers);
userRoutes.get('/:id', mwAuth.auth, getUsers);
userRoutes.put('/:id', mwAuth.auth, mwRole.admin, updateUser);
userRoutes.delete('/:id', mwAuth.auth, mwRole.admin, deleteUser);

export default userRoutes;