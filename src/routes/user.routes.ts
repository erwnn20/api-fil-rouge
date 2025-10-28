import {Router} from "express";
import {createUser, deleteUser, getUsers, updateUser} from "../controllers/user.controller";
import * as mwAuth from "../middleware/auth.middleware";
import * as mwRole from "../middleware/role.middleware";


const userRoutes = Router();

userRoutes.get('/', mwAuth.auth, getUsers);
userRoutes.get('/:id', mwAuth.auth, getUsers);
userRoutes.post('/', mwAuth.auth, mwRole.required("ADMIN"), createUser);
userRoutes.put('/:id', mwAuth.auth, mwRole.required("ADMIN"), updateUser);
userRoutes.delete('/:id', mwAuth.auth, mwRole.required("ADMIN"), deleteUser);

export default userRoutes;