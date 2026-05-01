import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Banner from '../models/Banner';

export const updateBanner = async (req: any, res: any) => {
  try {
    let banner = await Banner.findOne();
    if (!banner) {
      banner = await Banner.create({ 
        images: req.body.images,
        title: req.body.title,
        subtitle: req.body.subtitle
      });
    } else {
      if (req.body.images !== undefined) banner.images = req.body.images;
      if (req.body.title !== undefined) banner.title = req.body.title;
      if (req.body.subtitle !== undefined) banner.subtitle = req.body.subtitle;
      await banner.save();
    }
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: 'Error updating banner' });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const usersCount = await User.countDocuments();
    
    res.json({
      revenue: totalSales[0]?.total || 0,
      orders: ordersCount,
      products: productsCount,
      users: usersCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error updating product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product' });
  }
};
