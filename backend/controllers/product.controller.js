const Product = require('../models/product.model');

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.isFeatured !== undefined) filter.isFeatured = req.query.isFeatured === 'true';

    // Price range filtering
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
      filter.price = {};
      if (req.query.minPrice !== undefined) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice !== undefined) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Stock availability filtering
    if (req.query.inStock === 'true') filter.stock = { $gt: 0 };
    if (req.query.inStock === 'false') filter.stock = 0;

    const total = await Product.countDocuments(filter);
    const data = await Product.find(filter)
      .populate('vendor', 'name')
      .skip(skip)
      .limit(limit);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'name email phone');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const productData = { 
        ...req.body, 
        createdBy: req.user._id 
    };
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
