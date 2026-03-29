const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');
const path         = require('path');

const authRoutes        = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes      = require('./routes/budgets');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ── Security & utility middleware ──────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'blob:'],
    },
  },
}));

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_ORIGIN]
  : [/^http:\/\/localhost:\d+$/];   // allow ANY localhost port in development

app.use(cors({
  origin:      allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Rate limiting — auth routes only ──────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      10,
  message:  { success: false, message: 'Too many requests — try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth',         authLimiter, authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets',      budgetRoutes);

// ── Serve React frontend in production ────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuild));

  // Any route that is not /api/* sends back the React index.html
  // so client-side routing (React Router) works correctly
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
} else {
  // In development the Vite dev server handles the frontend
  app.use(notFound);
}

// ── Error handling ─────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
