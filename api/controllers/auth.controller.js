import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const test = (req, res) => {
  res.json({ message: 'API is working!' });
};

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password || username === '' || email === '' || password === '') {
    next(errorHandler(400, 'All fields are required'));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP expiry to 5 minutes from now
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    otp,
    otpExpiry,
    isVerified: false,
  });

  try {
    await newUser.save();
    
    // Send OTP email
    const { sendOTPEmail } = await import('../utils/email.service.js');
    await sendOTPEmail(email, otp);
    
    res.json({ 
      success: true,
      message: 'Signup successful. Please check your email for OTP verification.',
      email: email
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === '' || password === '') {
    next(errorHandler(400, 'All fields are required'));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, 'User not found'));
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, 'Invalid password'));
    }
    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET
    );

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie('access_token', token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET
      );
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          name.toLowerCase().split(' ').join('') +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET
      );
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(errorHandler(400, 'Email and OTP are required'));
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    if (user.isVerified) {
      return next(errorHandler(400, 'User is already verified'));
    }

    if (!user.otp || !user.otpExpiry) {
      return next(errorHandler(400, 'No OTP found. Please request a new one.'));
    }

    // Check if OTP has expired
    if (new Date() > user.otpExpiry) {
      return next(errorHandler(400, 'OTP has expired. Please request a new one.'));
    }

    // Verify OTP
    if (user.otp !== otp) {
      return next(errorHandler(400, 'Invalid OTP'));
    }

    // Update user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(errorHandler(400, 'Email is required'));
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    if (user.isVerified) {
      return next(errorHandler(400, 'User is already verified'));
    }

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiry to 5 minutes from now
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const { sendOTPEmail } = await import('../utils/email.service.js');
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email',
    });
  } catch (error) {
    next(error);
  }
};
