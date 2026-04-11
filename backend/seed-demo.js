/**
 * seed-demo.js — Populate the database with realistic demo data
 * for vendors, customers, orders, invoices, payments, and offers.
 * 
 * Run:  node seed-demo.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User     = require('./models/user.model');
const Customer = require('./models/customer.model');
const Vendor   = require('./models/vendor.model');
const Product  = require('./models/product.model');
const Order    = require('./models/order.model');
const Invoice  = require('./models/invoice.model');
const Payment  = require('./models/payment.model');
const Offer    = require('./models/offer.model');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('→ Connected to DB');

  // ─── Clean existing demo data (keep products & users) ───
  await Vendor.deleteMany({});
  await Customer.deleteMany({});
  await Order.deleteMany({});
  await Invoice.deleteMany({});
  await Payment.deleteMany({});
  await Offer.deleteMany({});
  console.log('→ Cleaned old demo data');

  // ─── Get admin user ───
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('✗ No admin user found. Register one first.');
    process.exit(1);
  }

  // ─── Get products ───
  const products = await Product.find({ isActive: true }).limit(20);
  if (products.length === 0) {
    console.error('✗ No products found. Run `node seed.js` first.');
    process.exit(1);
  }

  // ═══════════════════════════════════════════
  // 1. VENDORS
  // ═══════════════════════════════════════════
  const vendors = await Vendor.create([
    { name: 'StyleCraft Textiles', email: 'hello@stylecraft.in', phone: '9876543210', company: 'StyleCraft Pvt Ltd', address: { street: '45 Textile Lane', city: 'Surat', state: 'Gujarat', zip: '395003', country: 'India' }, isActive: true },
    { name: 'UrbanThread Co.', email: 'contact@urbanthread.com', phone: '9988776655', company: 'UrbanThread LLP', address: { street: '12 Fashion Hub', city: 'Mumbai', state: 'Maharashtra', zip: '400001', country: 'India' }, isActive: true },
    { name: 'Denim Works India', email: 'info@denimworks.in', phone: '8877665544', company: 'Denim Works', address: { street: '78 Industrial Area', city: 'Ahmedabad', state: 'Gujarat', zip: '380015', country: 'India' }, isActive: true },
    { name: 'Cotton Kings', email: 'orders@cottonkings.in', phone: '7766554433', company: 'Cotton Kings Pvt Ltd', address: { street: '23 Mill Road', city: 'Coimbatore', state: 'Tamil Nadu', zip: '641001', country: 'India' }, isActive: true },
    { name: 'FabWear International', email: 'sourcing@fabwear.com', phone: '9911223344', company: 'FabWear Intl', address: { street: '5 Export Zone', city: 'Tirupur', state: 'Tamil Nadu', zip: '641602', country: 'India' }, isActive: false },
  ]);
  console.log(`→ Seeded ${vendors.length} vendors`);

  // ═══════════════════════════════════════════
  // 2. CUSTOMERS
  // ═══════════════════════════════════════════
  const customers = await Customer.create([
    { name: 'Bhavsar Manav', email: 'manav@example.com', phone: '9090909090', company: 'PDPU', address: { street: '123 University Road', city: 'Gandhinagar', state: 'Gujarat', zip: '382007', country: 'India' }, billingAddress: { street: '123 University Road', city: 'Gandhinagar', state: 'Gujarat', zip: '382007', country: 'India' }, paymentTerms: 30, creditLimit: 50000, isActive: true },
    { name: 'Priya Sharma', email: 'priya@example.com', phone: '8080808080', company: 'TechCorp', address: { street: '45 Bandra West', city: 'Mumbai', state: 'Maharashtra', zip: '400050', country: 'India' }, paymentTerms: 15, creditLimit: 100000, isActive: true },
    { name: 'Rahul Verma', email: 'rahul.v@example.com', phone: '7070707070', company: 'Design Studio', address: { street: '78 MG Road', city: 'Bangalore', state: 'Karnataka', zip: '560001', country: 'India' }, paymentTerms: 30, creditLimit: 75000, isActive: true },
    { name: 'Ananya Patel', email: 'ananya@example.com', phone: '6060606060', company: 'Fashionista', address: { street: '12 SG Highway', city: 'Ahmedabad', state: 'Gujarat', zip: '380054', country: 'India' }, paymentTerms: 45, creditLimit: 200000, isActive: true },
    { name: 'Vikram Singh', email: 'vikram@example.com', phone: '5050505050', company: 'V Retail', address: { street: '34 Connaught Place', city: 'Delhi', state: 'Delhi', zip: '110001', country: 'India' }, paymentTerms: 30, creditLimit: 150000, isActive: true },
    { name: 'Sneha Reddy', email: 'sneha@example.com', phone: '4040404040', company: '', address: { street: '56 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', zip: '500033', country: 'India' }, isActive: true },
  ]);
  console.log(`→ Seeded ${customers.length} customers`);

  // ═══════════════════════════════════════════
  // 3. OFFERS
  // ═══════════════════════════════════════════
  const offers = await Offer.create([
    { title: 'Summer Sale 20% Off', code: 'SUMMER20', type: 'percentage', value: 20, minOrderAmt: 500, maxUses: 100, usedCount: 12, startDate: new Date('2026-03-01'), endDate: new Date('2026-06-30'), isActive: true, createdBy: admin._id },
    { title: 'Flat ₹500 Off', code: 'FLAT500', type: 'fixed', value: 500, minOrderAmt: 2000, maxUses: 50, usedCount: 8, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), isActive: true, createdBy: admin._id },
    { title: 'Free Shipping Over ₹999', code: 'FREESHIP', type: 'free_shipping', value: 0, minOrderAmt: 999, maxUses: 200, usedCount: 34, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), isActive: true, createdBy: admin._id },
    { title: 'New Customer 10% Off', code: 'WELCOME10', type: 'percentage', value: 10, minOrderAmt: 0, maxUses: 500, usedCount: 67, isActive: true, createdBy: admin._id },
    { title: 'Diwali Mega Sale', code: 'DIWALI50', type: 'percentage', value: 50, minOrderAmt: 1000, maxUses: 30, usedCount: 30, startDate: new Date('2025-10-15'), endDate: new Date('2025-11-15'), isActive: false, createdBy: admin._id },
  ]);
  console.log(`→ Seeded ${offers.length} offers`);

  // ═══════════════════════════════════════════
  // 4. ORDERS (with realistic statuses)
  // ═══════════════════════════════════════════
  const orderConfigs = [
    { custIdx: 0, productIdxs: [0, 2],       qtys: [2, 1],  status: 'delivered',  paymentStatus: 'paid',    daysAgo: 25, offerIdx: 0 },
    { custIdx: 1, productIdxs: [5, 8],       qtys: [1, 1],  status: 'delivered',  paymentStatus: 'paid',    daysAgo: 20 },
    { custIdx: 2, productIdxs: [10, 12, 14], qtys: [3, 2, 1], status: 'shipped',  paymentStatus: 'paid',    daysAgo: 10 },
    { custIdx: 3, productIdxs: [1, 3, 7],    qtys: [1, 2, 1], status: 'processing', paymentStatus: 'unpaid',  daysAgo: 5, offerIdx: 1 },
    { custIdx: 4, productIdxs: [4, 6],       qtys: [1, 1],  status: 'confirmed',  paymentStatus: 'unpaid',  daysAgo: 3 },
    { custIdx: 0, productIdxs: [9, 11],      qtys: [2, 1],  status: 'pending',    paymentStatus: 'unpaid',  daysAgo: 1 },
    { custIdx: 5, productIdxs: [13, 15, 0],  qtys: [1, 1, 3], status: 'delivered', paymentStatus: 'paid',   daysAgo: 45 },
    { custIdx: 1, productIdxs: [2, 4, 6, 8], qtys: [1, 1, 2, 1], status: 'delivered', paymentStatus: 'paid', daysAgo: 60, offerIdx: 3 },
    { custIdx: 3, productIdxs: [0],          qtys: [5],     status: 'cancelled',  paymentStatus: 'unpaid',  daysAgo: 15 },
    { custIdx: 2, productIdxs: [5, 10],      qtys: [1, 2],  status: 'pending',    paymentStatus: 'unpaid',  daysAgo: 0 },
  ];

  const createdOrders = [];

  for (const cfg of orderConfigs) {
    const cust = customers[cfg.custIdx];
    const orderItems = [];
    let subtotal = 0;

    for (let i = 0; i < cfg.productIdxs.length; i++) {
      const pIdx = cfg.productIdxs[i] % products.length;
      const p = products[pIdx];
      const qty = cfg.qtys[i];
      const itemTotal = p.price * qty;
      subtotal += itemTotal;
      orderItems.push({
        product: p._id,
        productName: p.name,
        sku: p.sku,
        qty,
        unitPrice: p.price,
        discount: 0,
        total: itemTotal,
      });
    }

    let discountAmount = 0;
    let offerId = null;
    let offerCode = null;

    if (cfg.offerIdx !== undefined) {
      const offer = offers[cfg.offerIdx];
      offerId = offer._id;
      offerCode = offer.code;
      if (offer.type === 'percentage') discountAmount = subtotal * (offer.value / 100);
      else if (offer.type === 'fixed') discountAmount = offer.value;
    }

    const taxRate = 5;
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const total = subtotal - discountAmount + taxAmount;

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - cfg.daysAgo);

    const order = await Order.create({
      customer: cust._id,
      placedBy: admin._id,
      items: orderItems,
      status: cfg.status,
      paymentStatus: cfg.paymentStatus,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      shippingCharge: 0,
      total,
      offer: offerId,
      offerCode,
      shippingAddress: cust.address,
      notes: `Demo order — ${cfg.status}`,
      createdBy: admin._id,
      createdAt,
    });

    // Update stats
    cust.totalOrders = (cust.totalOrders || 0) + 1;
    cust.totalSpent = (cust.totalSpent || 0) + total;
    await cust.save();

    createdOrders.push(order);
  }
  console.log(`→ Seeded ${createdOrders.length} orders`);

  // ═══════════════════════════════════════════
  // 5. INVOICES (linked to delivered/shipped orders)
  // ═══════════════════════════════════════════
  const invoiceOrders = createdOrders.filter(o => ['delivered', 'shipped', 'processing', 'confirmed'].includes(o.status));
  const createdInvoices = [];

  const invoiceStatuses = ['paid', 'paid', 'sent', 'sent', 'sent', 'overdue', 'paid', 'draft'];

  for (let i = 0; i < invoiceOrders.length; i++) {
    const order = invoiceOrders[i];
    const invStatus = invoiceStatuses[i % invoiceStatuses.length];

    const amountPaid = invStatus === 'paid' ? order.total : 0;

    const dueDate = new Date(order.createdAt);
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await Invoice.create({
      order: order._id,
      customer: order.customer,
      items: order.items.map(it => ({
        description: it.productName,
        qty: it.qty,
        unitPrice: it.unitPrice,
        total: it.total,
      })),
      subtotal: order.subtotal,
      tax: order.taxAmount,
      discount: order.discountAmount,
      total: order.total,

      status: invStatus,
      dueDate,
      paidAt: invStatus === 'paid' ? new Date() : undefined,
      notes: `Invoice for Order ${order.orderNumber}`,
      createdBy: admin._id,
      createdAt: order.createdAt,
    });

    // Link invoice back to order
    order.invoice = invoice._id;
    await order.save();

    createdInvoices.push(invoice);
  }
  console.log(`→ Seeded ${createdInvoices.length} invoices`);

  // ═══════════════════════════════════════════
  // 6. PAYMENTS (for paid/partial invoices)
  // ═══════════════════════════════════════════
  const paidInvoices = createdInvoices.filter(inv => inv.status === 'paid');
  const paymentMethods = ['upi', 'card', 'bank_transfer', 'upi', 'card', 'cash'];
  let paymentCount = 0;

  for (let i = 0; i < paidInvoices.length; i++) {
    const inv = paidInvoices[i];
    const method = paymentMethods[i % paymentMethods.length];

    // For "paid" invoices, generate a single full payment
    // For "partial" invoices, generate two partial payments
    if (inv.status === 'paid') {
      await Payment.create({
        invoice: inv._id,
        customer: inv.customer,
        amount: inv.total,
        method,
        status: 'completed',
        transactionId: `TXN${Date.now()}${i}`,
        paidAt: new Date(),
        notes: `Full payment for ${inv.invoiceNumber}`,
        recordedBy: admin._id,
      });
      paymentCount++;
    }
  }
  console.log(`→ Seeded ${paymentCount} payments`);

  // ═══════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════
  console.log('\n✓ Demo data seeded successfully!');
  console.log(`  Vendors:    ${vendors.length}`);
  console.log(`  Customers:  ${customers.length}`);
  console.log(`  Offers:     ${offers.length}`);
  console.log(`  Orders:     ${createdOrders.length}`);
  console.log(`  Invoices:   ${createdInvoices.length}`);
  console.log(`  Payments:   ${paymentCount}`);
  console.log('\n  Admin login:  admin@admin.com / password123');
  console.log('  Active coupons: SUMMER20, FLAT500, FREESHIP, WELCOME10');

  process.exit();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
