import {Router} from "express";
import {createUser, deleteUser, getUsers, updateUser} from "../controllers/user.controller";

const userRoutes = Router();

userRoutes.post('/', createUser);
userRoutes.get('/', getUsers);
userRoutes.get('/:id', getUsers);
userRoutes.put('/:id', updateUser);
userRoutes.delete('/:id', deleteUser);

export default userRoutes;