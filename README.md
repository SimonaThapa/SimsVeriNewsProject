# SimsVeriNews — AI-Powered Fake News Detector

A full-stack web application that uses a **99.27% accurate SVM machine learning model** to classify news claims as Real, Fake, or Uncertain — with gamification, sourcing, trends, quizzes, educational content, and an admin panel.

---

##  Project Structure

```
fakenews/
├── backend/                        ← Flask REST API
│   ├── app.py                      ← Main entry point
│   ├── db.py                       ← MongoDB connection
│   ├── .env.example                ← Environment variable template
│   ├── requirements.txt
│   ├── middleware/
│   │   └── auth.py                 ← JWT + role-based guards
│   ├── ml/
│   │   ├── train_model.py          ← Train your SVM model
│   │   ├── predictor.py            ← Load model + predict
│   │   ├── True.csv                ← Place your dataset here
│   │   └── Fake News project.csv   ← Place your dataset here
│   └── routes/
│       ├── auth.py                 ← /api/auth
│       ├── detection.py            ← /api/detect
│       ├── users.py                ← /api/users
│       ├── notifications.py        ← /api/notifications
│       ├── extra.py                ← /api/quiz, /api/trends, /api/educational, /api/chatbot
│       └── admin.py                ← /api/admin
│
└── frontend/                       ← React + Vite
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx                 ← All routes
        ├── main.jsx
        ├── index.css               ← Global design system
        ├── api/axios.js            ← Axios with JWT headers
        ├── context/AuthContext.jsx ← Global auth state
        ├── components/
        │   ├── layout/UserLayout   ← Sidebar for users
        │   ├── layout/AdminLayout  ← Sidebar for admins
        │   ├── ui/Navbar           ← Public navbar
        │   ├── ui/Footer           ← Footer with contact form
        │   └── ui/Chatbot          ← Floating chatbot
        └── pages/
            ├── public/   HomePage, AboutPage, ContactPage, LoginPage, RegisterPage
            ├── user/     Dashboard, InputClaimPage, ResultPage, TrendsPage,
            │             QuizPage, NotificationsPage, EducationalPage, LeaderboardPage
            └── admin/    AdminDashboard, ManageUsers, ManageClaims,
                          ManageNotifications, ManageQuiz, ManageEducational
