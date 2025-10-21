import express from 'express';
import userRoutes from "./routes/user.routes";

const app = express();

app.use(express.json());

// Routes
app.use('/api/v1/users', userRoutes);

// Global error handler (should be after routes)
// app.use(errorHandler);

export default app;
