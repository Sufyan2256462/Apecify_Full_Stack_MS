# 🏫 Apecify Full Stack MS

A comprehensive full-stack school management system built with React frontend and Node.js backend, designed to streamline educational institution operations.

![School Management System](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge\&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.0+-green?style=for-the-badge\&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green?style=for-the-badge\&logo=mongodb)
![Express.js](https://img.shields.io/badge/Express.js-4.18.2-black?style=for-the-badge\&logo=express)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge\&logo=json-web-tokens)

## ✨ Features

### 👨‍🎓 Student Management

* Student registration and profile management
* Class enrollment and scheduling
* Academic progress tracking
* Attendance monitoring

### 👨‍🏫 Teacher Management

* Teacher profiles and credentials
* Class assignment and scheduling
* Grade management system
* Communication tools

### 🏫 Class & Course Management

* Class creation and organization
* Course catalog management
* Timetable scheduling
* Resource allocation

### 📊 Attendance System

* Real-time attendance tracking
* Attendance reports and analytics
* Absence notifications
* Historical data access

### 📝 Assignment Management

* Assignment creation and distribution
* Submission tracking
* Grading system
* Feedback mechanism

### 🎯 Grade Management

* Grade entry and calculation
* Progress reports
* Transcript generation
* Performance analytics

### 📢 Announcements & Communication

* School-wide announcements
* Class-specific notifications
* Real-time messaging
* Event notifications

### 📅 Calendar & Events

* Academic calendar
* Event scheduling
* Reminder system
* Holiday management

### 📚 Downloadable Materials

* Study materials repository
* Assignment resources
* Lecture notes
* Multimedia content

### 💰 Fee Management

* Fee structure management
* Payment tracking
* Receipt generation
* Financial reports

## 🏗️ Project Structure

```
Apecify_Full_Stack_MS/
├── client/                 # React Frontend Application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── studentTabs/   # Student-specific components
│   │   ├── teacherTabs/   # Teacher-specific components
│   │   ├── App.js         # Main application component
│   │   └── index.js       # Application entry point
│   └── package.json       # Frontend dependencies
│
├── server/                # Node.js Backend Application
│   ├── models/            # MongoDB Mongoose models
│   ├── routes/            # Express route handlers
│   ├── services/          # Business logic services
│   ├── uploads/           # File upload directory
│   ├── utils/             # Utility functions
│   ├── index.js           # Server entry point
│   └── package.json       # Backend dependencies
│
├── uploads/               # Uploaded files directory
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

## 🚀 Quick Start

### Prerequisites

* **Node.js** (v18.0 or higher)
* **MongoDB** (v6.0 or higher)
* **npm** or **yarn** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sufyan2256462/Apecify_Full_Stack_MS.git
   cd Apecify_Full_Stack_MS
   ```

2. **Install backend dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the server directory:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/apecify_db
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

5. **Start the development servers**

   **Backend Server:**

   ```bash
   cd server
   npm run dev
   ```

   **Frontend Server:**

   ```bash
   cd client
   npm start
   ```

6. **Access the application**

   * Frontend: [http://localhost:3000](http://localhost:3000)
   * Backend API: [http://localhost:5000](http://localhost:5000)

## 🛠️ Technologies Used

### Frontend

* **React** - UI framework
* **CSS3** - Styling and responsive design
* **JavaScript (ES6+)** - Programming language
* **Axios** - HTTP client for API calls

### Backend

* **Node.js** - Runtime environment
* **Express.js** - Web framework
* **MongoDB** - NoSQL database
* **Mongoose** - MongoDB object modeling
* **JWT** - Authentication tokens
* **Multer** - File upload handling
* **bcrypt** - Password hashing

### Development Tools

* **Nodemon** - Development server restart
* **Concurrently** - Run multiple commands
* **Git** - Version control

## 📋 API Endpoints

### Authentication

* `POST /api/auth/login` - User login
* `POST /api/auth/register` - User registration
* `GET /api/auth/verify` - Token verification

### Student Management

* `GET /api/students` - Get all students
* `POST /api/students` - Create new student
* `GET /api/students/:id` - Get student by ID
* `PUT /api/students/:id` - Update student
* `DELETE /api/students/:id` - Delete student

### Teacher Management

* `GET /api/teachers` - Get all teachers
* `POST /api/teachers` - Create new teacher
* `GET /api/teachers/:id` - Get teacher by ID
* `PUT /api/teachers/:id` - Update teacher

### Class Management

* `GET /api/classes` - Get all classes
* `POST /api/classes` - Create new class
* `GET /api/classes/:id` - Get class by ID
* `PUT /api/classes/:id` - Update class

### Attendance

* `POST /api/attendance` - Mark attendance
* `GET /api/attendance` - Get attendance records
* `GET /api/attendance/:studentId` - Get student attendance

## 🎨 User Roles

### Admin

* Full system access
* User management
* System configuration
* Reports and analytics

### Teacher

* Class management
* Student grading
* Attendance marking
* Resource upload

### Student

* View classes and schedule
* Submit assignments
* Check grades
* Access materials

## 📁 Database Models

* **Student** - Student information and academic records
* **Teacher** - Teacher profiles and credentials
* **Class** - Class details and scheduling
* **Attendance** - Attendance records
* **Assignment** - Assignment details and submissions
* **Grade** - Student grades and performance
* **Announcement** - School announcements
* **Event** - Calendar events
* **DownloadableMaterial** - Study resources
* **Fee** - Fee structure and payments

## 🔧 Development Scripts

### Backend (server/package.json)

* `npm start` - Start production server
* `npm run dev` - Start development server with nodemon
* `npm test` - Run tests

### Frontend (client/package.json)

* `npm start` - Start development server
* `npm build` - Build for production
* `npm test` - Run tests
* `npm eject` - Eject from Create React App

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

* Create an issue on GitHub
* Email: \[sufianliaqat4422@gmail.com]
* Documentation: \[Link to documentation]

## 🚀 Deployment

### Production Deployment

1. **Build the frontend:**

   ```bash
   cd client
   npm run build
   ```

2. **Set production environment variables**

   ```env
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_jwt_secret
   ```

3. **Start production server**

   ```bash
   cd server
   npm start
   ```

### Docker Deployment (Optional)

```bash
docker-compose up --build
```

---

**⭐ Star this repository if you find it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/Sufyan2256462/Apecify_Full_Stack_MS?style=social)](https://github.com/Sufyan2256462/Apecify_Full_Stack_MS/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Sufyan2256462/Apecify_Full_Stack_MS?style=social)](https://github.com/Sufyan2256462/Apecify_Full_Stack_MS/network/members)
