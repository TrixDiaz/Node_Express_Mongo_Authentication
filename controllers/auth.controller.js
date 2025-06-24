import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../config/env.js";
import transporter from "../config/nodemailer.js";
// import LoginLogs from "../models/login-logs.model.js";
import RefreshToken from "../models/refresh-token.model.js";

export const signUp = async (req, res, next) => {
  try {
    // Logic to create a new user
    const {name, email, password} = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({email: email});

    // If user already exists, return an error
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      return next(error);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
      isVerified: false,
    });

    // Generate JWT token
    const verificationToken = jwt.sign({userId: newUser._id}, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Create verification URL
    // const verificationURL = `http://yourfrontend.com/verify-email/${verificationToken}`;

    // Send verification email
    // const mailOptions = {
    //   from: "noreply@noreply.com",
    //   to: email,
    //   subject: "Email Verification",
    //   text:
    //     `Hello ${name},\n\n` +
    //     `Please verify your email by clicking the link:\n` +
    //     `${verificationURL}\n\n` +
    //     `This link will expire in 24 hours.\n`,
    // };

    // await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        verificationToken,
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const {email, password} = req.body;
    // const ipAddress = req.ip;
    // const userAgent = req.headers["user-agent"];

    // Find user by email
    const user = await User.findOne({email: email});

    // Create login log
    // const createLoginLog = async (status, reason = null) => {
    //   await LoginLogs.create({
    //     userId: user?._id || null,
    //     name: user?.name || null,
    //     email,
    //     status,
    //     ipAddress: ipAddress || null,
    //     userAgent: userAgent || null,
    //     reason,
    //   });
    // };

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // Check if email is verified
    // if (!user.isVerified) {
    //   const error = new Error("Please verify your email before signing in");
    //   error.statusCode = 403;
    //   return next(error);
    // }

    // Check if account is locked
    if (user.isLocked) {
      const error = new Error(
        "Account is locked. Please contact administrator"
      );
      error.statusCode = 403;
      return next(error);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Check if attempts exceed limit
      if (user.loginAttempts >= 5) {
        user.isLocked = true;
        await user.save();
        const error = new Error(
          "Account locked due to multiple failed attempts. Please contact administrator"
        );
        error.statusCode = 403;
        return next(error);
      }

      // Save the incremented attempts
      await user.save();
      // await createLoginLog("failed", "Invalid password");
      const error = new Error(
        `Invalid password. ${5 - user.loginAttempts} attempts remaining`
      );
      error.statusCode = 401;
      return next(error);
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      await user.save();
    }

    // Generate access token
    const accessToken = jwt.sign({userId: user._id}, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Generate refresh token
    const refreshToken = jwt.sign({userId: user._id}, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    // Save refresh token to database
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(
        Date.now() + parseInt(REFRESH_TOKEN_EXPIRES_IN) * 1000
      ),
    });

    // await createLoginLog("success");

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        accessToken,
        refreshToken,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const {refreshToken} = req.body;

    if (!refreshToken) {
      const error = new Error("Refresh token is required");
      error.statusCode = 400;
      return next(error);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (error) {
      return next(error);
    }

    // Check if token exists in database and is not revoked
    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      userId: decoded.userId,
      isRevoked: false,
    });

    if (!tokenDoc) {
      const error = new Error("Refresh token not found or has been revoked");
      error.statusCode = 401;
      return next(error);
    }

    // Check if token has expired
    if (tokenDoc.expiresAt < new Date()) {
      const error = new Error("Refresh token has expired");
      error.statusCode = 401;
      return next(error);
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // Generate new access token
    const newAccessToken = jwt.sign({userId: user._id}, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Generate new refresh token
    const newRefreshToken = jwt.sign({userId: user._id}, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    // Revoke old refresh token
    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    // Save new refresh token
    await RefreshToken.create({
      userId: user._id,
      token: newRefreshToken,
      expiresAt: new Date(
        Date.now() + parseInt(REFRESH_TOKEN_EXPIRES_IN) * 1000
      ),
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    const {refreshToken} = req.body;

    if (refreshToken) {
      // Revoke refresh token
      await RefreshToken.findOneAndUpdate(
        {token: refreshToken},
        {isRevoked: true}
      );
    }

    res.status(200).json({
      success: true,
      message: "User signed out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const {email} = req.body;

    if (!email) {
      const error = new Error("Email is required");
      error.statusCode = 401;
      return next(error);
    }

    // Find user by email
    const user = await User.findOne({email: email});

    // If user does not exist
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // Generate reset token
    const resetToken = jwt.sign({userId: user._id}, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Create reset password URL
    const resetURL = `http://yourfrontend.com/reset-password/${resetToken}`;

    // Configure mail options
    const mailOptions = {
      from: "noreply@noreply.com",
      to: user.email,
      subject: "Password Reset Request",
      text:
        `Hello ${user.name},\n\n` +
        `You have requested to reset your password.\n\n` +
        `Please click on the following link to reset your password:\n` +
        `${resetURL}\n\n` +
        `This link will expire in 1 hour.\n\n` +
        `If you did not request this, please ignore this email.\n`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
      data: {
        resetToken,
        resetURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const {token} = req.params;
    const {password} = req.body;

    if (!token || !password) {
      const error = new Error("Token and password are required");
      error.statusCode = 400;
      return next(error);
    }

    // Verify token
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      error.message = "Invalid or expired token";
      error.statusCode = 401;
      return next(error);
    }

    // Find user
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password and unlock account if locked
    user.password = hashedPassword;
    user.loginAttempts = 0;
    user.isLocked = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const {token} = req.params;

    // Verify token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      error.message = "Invalid or expired verification token";
      error.statusCode = 401;
      return next(error);
    }

    // Find and update user
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // Update verification status
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const validateToken = async (req, res, next) => {
  try {
    // The user info is already available from the auth middleware
    // We just need to return the validation response
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // Check if user account is locked or not verified
    if (user.isLocked) {
      const error = new Error("Account is locked");
      error.statusCode = 403;
      return next(error);
    }

    // Optionally check if email is verified
    // if (!user.isVerified) {
    //   const error = new Error("Email not verified");
    //   error.statusCode = 403;
    //   return next(error);
    // }

    res.status(200).json({
      success: true,
      valid: true,
      message: "Token is valid",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    const error = new Error("Access token is required");
    error.statusCode = 401;
    return next(error);
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      let error;

      if (err.name === "TokenExpiredError") {
        error = new Error("Token has expired");
        error.statusCode = 401;
        error.code = "TOKEN_EXPIRED";
      } else if (err.name === "JsonWebTokenError") {
        error = new Error("Invalid token");
        error.statusCode = 401;
        error.code = "INVALID_TOKEN";
      } else {
        error = new Error("Token verification failed");
        error.statusCode = 401;
        error.code = "TOKEN_VERIFICATION_FAILED";
      }

      return next(error);
    }

    // Add decoded user info to request
    req.user = decoded;
    next();
  });
};
