# 🍰 Cake Selling App

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for selling and managing cakes with role-based access control for customers, sellers, and administrators.

## 🌐 Live Demo

**Frontend:** [https://cake-selling-app.vercel.app/](https://cake-selling-app.vercel.app/)  
**Backend API:** [https://cake-selling-app.onrender.com/api](https://cake-selling-app.onrender.com/api)

## ✨ Features

### 🛍️ Customer Features
- Browse and search cakes
- Add cakes to wishlist and cart
- Place orders with secure checkout
- View order history and tracking
- User profile management
- Real-time notifications

### 🏪 Seller Features
- Upload and manage cake listings
- Track orders and sales
- Manage inventory
- View sales analytics
- Order fulfillment

### 👨‍💼 Admin Features
- User management (customers, sellers)
- System-wide analytics and reports
- Content moderation
- Platform configuration

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control
- Protected routes
- Secure API endpoints
- Password encryption

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Sonner** - Toast notifications
- **Recharts** - Data visualization
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Sharp** - Image processing
- **Joi** - Validation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Cake-Selling_app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Static assets
│   ├── public/             # Public assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   ├── validations/       # Input validation
│   ├── uploads/           # File uploads
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **pnpm** (recommended)
- **MongoDB** (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cake-Selling_app
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd client
   pnpm install

   # Install backend dependencies
   cd ../server
   pnpm install
   ```

3. **Environment Setup**

   Create `.env` file in the `server` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI_PRODUCTION=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Start Development Servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   pnpm dev
   ```
   Backend will run on: http://localhost:5000

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   pnpm dev
   ```
   Frontend will run on: http://localhost:5173

## 🔧 Development

### Available Scripts

#### Frontend (client/)
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
```

#### Backend (server/)
```bash
pnpm dev          # Start development server with nodemon
pnpm start        # Start production server
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Cakes
- `GET /api/cakes` - Get all cakes
- `GET /api/cakes/:id` - Get cake by ID
- `POST /api/cakes` - Create new cake (seller only)
- `PUT /api/cakes/:id` - Update cake (seller only)
- `DELETE /api/cakes/:id` - Delete cake (seller only)

#### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:id` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

#### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

#### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/remove/:id` - Remove from wishlist

### Role-Based Access Control

The application implements role-based routing using React Router's `<Navigate />` component:

- **Customer Routes**: `/wishlist`, `/cart`, `/checkout`, `/orders`
- **Seller Routes**: `/cakes/my`, `/orders/seller`
- **Admin Routes**: `/dashboard/admin`
- **Shared Routes**: `/profile`, `/dashboard`

### Database Schema

#### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String, // 'customer', 'seller', 'admin'
  avatar: String
}
```

#### Cake Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  images: [String],
  seller: ObjectId,
  stock: Number
}
```

#### Order Model
```javascript
{
  user: ObjectId,
  items: [{
    cake: ObjectId,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: String,
  shippingAddress: Object
}
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd client && pnpm build`
3. Set output directory: `client/dist`
4. Deploy

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set build command: `cd server && pnpm install`
3. Set start command: `cd server && pnpm start`
4. Add environment variables
5. Deploy

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGO_URI_PRODUCTION=mongodb+srv://...
JWT_SECRET=your_secret_key
```

### Frontend (Vite)
The frontend automatically detects the environment and uses the appropriate API URL:
- Development: `http://localhost:5000/api`
- Production: `https://cake-selling-app.onrender.com/api`

## 📱 Usage

### For Customers
1. **Register/Login** - Create an account or sign in
2. **Browse Cakes** - View available cakes with filters
3. **Add to Cart/Wishlist** - Save items for later
4. **Checkout** - Complete purchase with shipping details
5. **Track Orders** - Monitor order status and history

### For Sellers
1. **Register as Seller** - Create seller account
2. **Upload Cakes** - Add cake listings with images
3. **Manage Inventory** - Update stock and prices
4. **Process Orders** - Fulfill customer orders
5. **View Analytics** - Track sales performance

### For Administrators
1. **User Management** - Oversee customers and sellers
2. **Content Moderation** - Review and approve listings
3. **System Analytics** - Monitor platform performance
4. **Configuration** - Manage platform settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Contact the development team

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vercel](https://vercel.com/) - Frontend hosting
- [Render](https://render.com/) - Backend hosting

---

**Happy Baking! 🍰** 