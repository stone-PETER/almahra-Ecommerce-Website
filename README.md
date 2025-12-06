# Almahra E-commerce Platform

Full-stack e-commerce platform for an optical/eyewear store built with Flask (Backend) and React (Frontend).

## 🚀 Quick Start

**New to this project? Start here:**

1. **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
2. **[HANDOVER.md](./HANDOVER.md)** - Complete project overview and status
3. **[backend/SETUP_GUIDE.md](./backend/SETUP_GUIDE.md)** - Detailed backend setup

## 📋 Project Structure

```
almahra-Ecommerce-Website/
├── backend/                 # Flask REST API
│   ├── app/                # Application code
│   ├── config/             # Configuration files
│   ├── migrations/         # Database migrations
│   ├── .env.example        # Environment template
│   └── requirements.txt    # Python dependencies
│
├── Almahra Ecommerce/      # React Frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── .env.example       # Environment template
│   └── package.json       # Node dependencies
│
└── Documentation/
    ├── QUICKSTART.md       # 5-minute setup guide
    ├── HANDOVER.md         # Project overview
    └── CLEANUP_SUMMARY.md  # What was changed
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask 3.0.0
- **Database**: PostgreSQL 16.x
- **Authentication**: JWT (Flask-JWT-Extended)
- **Payment**: Stripe API
- **Email**: Flask-Mail

### Frontend
- **Framework**: React 19.1.0
- **Bundler**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router

## ⚡ Quick Setup

### Prerequisites
- Python 3.8+
- PostgreSQL 16.x
- Node.js 18+

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
copy .env.example .env.development
# Edit .env.development with your database credentials
flask db upgrade
python run.py
```

### Frontend
```bash
cd "Almahra Ecommerce"
npm install
copy .env.example .env.development
npm run dev
```

## 🔐 Default Credentials

**Admin**: `admin@almahra.com` / `Admin@123`  
**Customer**: `test@example.com` / `Test@123456`

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started immediately
- **[HANDOVER.md](./HANDOVER.md)** - Complete project details, TODOs, and known issues
- **[CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md)** - Recent changes and cleanup details
- **[backend/SETUP_GUIDE.md](./backend/SETUP_GUIDE.md)** - Detailed backend documentation

## 🎯 Current Status

### ✅ Completed
- User authentication and authorization (JWT)
- Admin portal UI (Dashboard, Products, Users, Orders, Appointments)
- Product management API with variants and inventory tracking
- Order management system with status tracking
- Shopping cart functionality with backend sync
- Appointment booking system (guest + authenticated users)
- Database schema and migrations
- Email notifications
- Payment integration (Stripe + Cash on Delivery)

### 🚧 In Progress
- Advanced product filtering and search
- AR try-on feature
- Performance optimizations

### 📋 TODO
- Testing suite (unit + integration tests)
- Production deployment optimization
- API documentation (Swagger/OpenAPI)

## 🔧 Configuration

### Important Files
- `backend/.env.development` - Backend configuration (create from .env.example)
- `Almahra Ecommerce/.env.development` - Frontend configuration (create from .env.example)
- `backend/config/config.py` - Flask configuration

### Ports
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- PostgreSQL: `localhost:5432`

## 🆘 Need Help?

1. Check **[QUICKSTART.md](./QUICKSTART.md)** for common setup issues
2. Read **[HANDOVER.md](./HANDOVER.md)** for detailed project information
3. Review **[backend/SETUP_GUIDE.md](./backend/SETUP_GUIDE.md)** for backend specifics

## 📞 Support

For questions about the project setup or implementation, refer to the documentation files listed above.

---

**Ready to start? Begin with [QUICKSTART.md](./QUICKSTART.md)! 🚀**
