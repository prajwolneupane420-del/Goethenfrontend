import User from '../models/User';
import { generateToken } from '../utils/jwt';

export const sendOTP = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number required' });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, otp, otpExpires, name: 'Guest' });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    }

    // In a real app, send via SMS gateway. Here we log to console.
    console.log(`[AUTH] OTP for ${phone}: ${otp}`);
    console.log(`[AUTH] FOR PREVIEW TESTING USE: 123456`);
    
    res.status(200).json({ message: 'OTP sent successfully. In preview, use 123456', testOtp: '123456' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP required' });

  try {
    const user = await User.findOne({ phone });
    
    const isTestOtp = otp === '123456';
    
    if (!user || (!isTestOtp && (user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())))) {
      return res.status(400).json({ message: 'wrong otp try again' });
    }

    // Don't log the user in immediately. Just acknowledge verification.
    res.status(200).json({ message: 'verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const registerUser = async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!phone || !password || !name) return res.status(400).json({ message: 'Name, phone and password required' });

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Please verify OTP first' });
    
    user.name = name;
    if (email) user.email = email;
    user.password = password; // In production, hash this!
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'strict'
    });

    res.status(200).json({
      message: 'Registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUser = async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or phone
  if (!identifier || !password) return res.status(400).json({ message: 'Identifier and password required' });

  try {
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }] 
    });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'strict'
    });

    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  const { phone, otp, newPassword } = req.body;
  if (!phone || !otp || !newPassword) return res.status(400).json({ message: 'Missing fields' });

  try {
    const user = await User.findOne({ phone });
    const isTestOtp = otp === '123456';

    if (!user || (!isTestOtp && (user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())))) {
      return res.status(400).json({ message: 'wrong otp try again' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@ethenstreet.com' && password === 'Admin@12345') {
    try {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ 
          email, 
          password: 'Admin@12345',
          phone: "0000000000",
          role: 'admin',
          name: 'Super Admin'
        });
      }
      
      const token = generateToken(user._id);
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'strict'
      });
      
      return res.status(200).json({
        message: 'Admin logged in successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  res.status(401).json({ message: 'Invalid admin credentials' });
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const logout = (req, res) => {
  res.cookie('token', '', { expires: new Date(0) });
  res.status(200).json({ message: 'Logged out successfully' });
};
