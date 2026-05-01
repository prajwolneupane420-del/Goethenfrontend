import Product from '../models/Product';
import mongoose from 'mongoose';

export const getProducts = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection not ready. Check your MongoDB Atlas IP Whitelist.',
        error: 'DB_DISCONNECTED'
      });
    }

    const { category, minPrice, maxPrice, sort, search } = req.query;
    let query: any = {};

    if (category && category !== 'All') query.category = category;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    let productsQuery = Product.find(query);

    if (sort === 'price_asc') productsQuery = productsQuery.sort({ basePrice: 1 });
    else if (sort === 'price_desc') productsQuery = productsQuery.sort({ basePrice: -1 });
    else productsQuery = productsQuery.sort({ createdAt: -1 });

    const results = await productsQuery;
    res.json(results);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ message: 'Error fetching products', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product' });
  }
};

export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    const products = await Product.find({ 
      title: { $regex: q as string, $options: 'i' } 
    })
    .select('title images category')
    .limit(5);
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching suggestions' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
};
