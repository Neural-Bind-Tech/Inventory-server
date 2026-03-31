import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import httpStatus from 'http-status';
import { prisma } from './lib/prisma';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import routes from './app/routes';
import cron from 'node-cron';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Cookie parsing
const { COOKIE_SECRET } = process.env;
app.use(cookieParser(COOKIE_SECRET));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
const allowedOrigins = process.env['ALLOWED_ORIGINS']?.split(',') ?? [
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check
app.get('/health', async (_req: Request, res: Response) => {
  const dbHealth = await prisma.$queryRaw`SELECT 1`;
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbHealth ? 'connected' : 'disconnected',
  });
});

// API routes
app.use('/api/v1', routes);


//Cron Job
cron.schedule('*/5 * * * *', async (): Promise<void> => {
  try {
    
  } catch (error) {
    console.error('Error executing cron job:', error);
  }
});


// Global error handler (must be last)
app.use(globalErrorHandler);


// 404 handler
app.use((req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
});

export default app;
