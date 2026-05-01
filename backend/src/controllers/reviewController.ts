import Review from '../models/Review';
import Order from '../models/Order';

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

export const createFakeReview = async (req, res) => {
  try {
    const { productId, rating, comment, fakeName } = req.body;
    
    // Only admins checking handled in route
    const review = await Review.create({
      product: productId,
      fakeName,
      rating: Number(rating),
      comment
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error adding fake review', error });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    // Check if user has bought this product
    const orders = await Order.find({ user: req.user.id, 'items.product': productId, paymentStatus: 'paid' });
    if (orders.length === 0) {
      return res.status(403).json({ message: 'You must purchase this product before leaving a review.' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ product: productId, user: req.user.id });
    if (existingReview) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      rating,
      comment
    });

    const populatedReview = await review.populate('user', 'name');
    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review' });
  }
};
