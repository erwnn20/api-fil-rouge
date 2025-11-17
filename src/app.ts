import express from 'express';
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import AuthRoutes from "./routes/auth.routes";
import UserRoutes from "./routes/user.routes";
import AdminRoutes from "./routes/admin.routes";
import ApiRoutes from "./routes/api.routes";
import {specs} from "./config/swagger";


const app = express();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', AuthRoutes);
app.use('/admin', AdminRoutes);

app.use('/api/v1/users', UserRoutes);
app.use('/api/v2/posts', ApiRoutes);

// Route for Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));


export default app;
