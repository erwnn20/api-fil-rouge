import express from 'express';
import AuthRoutes from "./routes/auth.routes";
import UserRoutes from "./routes/user.routes";
import AdminRoutes from "./routes/admin.routes";

const app = express();

app.use(express.json());

// Routes
app.use('/auth', AuthRoutes);
app.use('/admin', AdminRoutes);

app.use('/api/v1/users', UserRoutes);

// Global error handler (should be after routes)
// app.use(errorHandler);

export default app;
