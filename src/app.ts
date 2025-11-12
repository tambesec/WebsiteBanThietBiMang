import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { paginationMiddleware } from './middleware/pagination';
import apiRoutes from './routes/index';

const app: Express = express();

// ====== MIDDLEWARE ======

// Security
app.use(helmet());

// CORS
app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging
if (env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Pagination Middleware
app.use(paginationMiddleware);

// ====== ROUTES ======

app.use(`/api/${env.API_VERSION}`, apiRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Không tìm thấy endpoint',
        timestamp: new Date().toISOString(),
    });
});

// ====== ERROR HANDLING ======

app.use(errorHandler);

export default app;
