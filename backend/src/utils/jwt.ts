import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ethenstreet_secret_key_2024';

export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const verifyToken = (token) => {
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
    throw new Error('jwt malformed');
  }
  return jwt.verify(token, JWT_SECRET);
};
