import cors from "cors";

// List of websites that can access your API
const allowedOrigins = [
    'http://localhost:3000',           // Your React app
    'http://localhost:5173',           // If using Vite
    'https://your-production-domain.com',  // Your live website
];

// CORS settings
const corsOptions = {
    // Which websites can access your API
    origin: allowedOrigins,

    // Which HTTP methods are allowed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],

    // Allow cookies and authentication headers
    credentials: true,

    // For older browsers compatibility
    optionsSuccessStatus: 204,

    // How long browsers can cache CORS settings (1 hour)
    maxAge: 3600,
};

// Export the CORS configuration
export default cors(corsOptions);

/*
HOW TO USE:

1. In your Express app:
   import corsConfig from './this-file.js';
   app.use(corsConfig);

2. Add your frontend URL to allowedOrigins array above

3. If you get CORS errors, make sure your frontend URL
   is exactly the same in the allowedOrigins array
*/