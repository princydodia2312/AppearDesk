const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    process.env.ADMIN_URL || 'http://localhost:5173',
    process.env.PORTAL_URL || 'http://localhost:5174',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth',     require('./routes/auth.routes'));
app.use('/api/users',    require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/customers',require('./routes/customer.routes'));
app.use('/api/vendors',  require('./routes/vendor.routes'));
app.use('/api/orders',   require('./routes/order.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/offers',   require('./routes/offer.routes'));
app.use('/api/reports',  require('./routes/report.routes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running', status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
