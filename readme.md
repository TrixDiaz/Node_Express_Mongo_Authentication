# Node.js Express Authentication System

A secure and scalable authentication system built with Node.js and Express.js, featuring JWT tokens, password hashing, and comprehensive user management.

## 🚀 Features

- **User Registration & Login** - Secure user authentication with email verification
- **JWT Token Authentication** - Stateless authentication using JSON Web Tokens
- **Password Security** - Bcrypt hashing with salt rounds for password protection
- **Email Verification** - Account activation via email confirmation
- **Password Reset** - Secure password recovery with time-limited tokens
- **Role-Based Access Control** - User roles and permissions management
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - Comprehensive request validation and sanitization
- **CORS Support** - Cross-Origin Resource Sharing configuration
- **Environment Configuration** - Secure environment variable management

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Email Service**: Nodemailer
- **Security**: helmet, cors, express-rate-limit

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- SMTP server credentials for email functionality

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TrixDiaz/NodeExpress-Authentication.git
   cd NodeExpress-Authentication
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/auth_app
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=1d
   JWT_COOKIE_EXPIRE=7
   
   # Email Configuration
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/sign-up
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123!",
  "confirmPassword": "StrongPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": false,
    "role": "user"
  }
}
```

#### Login User
```http
POST /api/v1/auth/sign-up
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "StrongPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Verify Email
```http
GET /api/auth/verify-email/:token
```

#### Forgot Password
```http
POST api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
PUT /api/v1/auth/reset-password/:token
Content-Type: application/json

{
  "password": "NewStrongPassword123!",
  "confirmPassword": "NewStrongPassword123!"
}
```

### Protected Routes

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer jwt_token_here
```

#### Update Profile
```http
PUT /api/v1/users/id
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### Change Password
```http
PUT /api/v1/users/id:/password
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

#### Logout
```http
POST /api/v1/auth/sign-out
Authorization: Bearer jwt_token_here
```

## 🔒 Security Features

### Password Security
- Minimum 6 characters with uppercase, lowercase, numbers, and special characters
- Bcrypt hashing with 10 salt rounds
- Password history to prevent reuse

### JWT Security
- Secure token generation with expiration
- Token blacklisting for logout functionality
- HttpOnly cookies for web applications

### Rate Limiting
- Request attempts: 5 attempts per 10 seconds

### Input Validation
- Email format validation
- Password strength requirements
- SQL injection prevention
- XSS protection with input sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style Guidelines
- Use ESLint and Prettier for code formatting
- Follow RESTful API conventions
- Write comprehensive tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or need support:

1. Check existing [GitHub Issues](https://github.com/TrixDiaz/NodeExpress-Authentication/issues)
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

## 📞 Contact

- **Developer**: TrixDiaz
- **GitHub**: [@TrixDiaz](https://github.com/TrixDiaz)
- **Email**: [Contact via GitHub](https://github.com/TrixDiaz)

## 🙏 Acknowledgements

- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [MongoDB](https://www.mongodb.com/) - Document database
- [JWT](https://jwt.io/) - JSON Web Tokens
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js/) - Password hashing library

---

⭐ **If this project helped you, please give it a star!** ⭐