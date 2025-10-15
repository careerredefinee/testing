

CareerRedefine is an AI-powered career development and learning platform that provides courses, services, mentorship, career resources, and advanced AI tools such as resume analysis, interview preparation, and skill gap analysis.



 🚀 Features

* **Courses & Services** – Explore courses, book interviews, and access detailed service pages
* **AI Tools (Gemini API Pro)**

  * Resume Analysis
  * Interview Simulator
  * Skill Gap Analysis
  * Salary Negotiation
  * AI Mentor & Path Finder
* **Jobs & Career Resources** – Job listings with apply option
* **Mentorship & Premium** – One-to-one sessions, materials, group chats, priority support
* **Admin Dashboard** – Manage users, jobs, courses, reviews, resumes, mentors, and premium features

---

 🛠 Tech Stack

**Frontend**

* ReactJS (Vite)
* Bootstrap 5, CSS, Tailwind
* HTML/JS (static pages in `/public`)
* Cloudinary (media storage)
* Gemini API Pro (AI assistant)

Backend

* Node.js + Express.js
* MongoDB (Mongoose)
* Nodemailer (Gmail OTP)
* Google OAuth2

---

📂 Project Structure

```
career-main/
│── .env / .env.production   # Environment configs
│── server.js                # Express backend
│── vite.config.ts           # Vite config
│── src/                     # React frontend
│   ├── pages/               # Pages (Home, Courses, Services, etc.)
│   ├── components/          # Reusable components (HeroSection, ChatAssistant, etc.)
│── controllers/             # Express controllers
│── models/                  # MongoDB schemas
│── routes/                  # Express routes
│── middleware/              # Auth middleware (JWT & role-based)
│── config/                  # DB & session configs
│── scripts/                 # Utility/admin scripts
│── public/                  # Static HTML pages
```

---

 👤 User Roles

* **Normal User** – Browse courses/jobs, AI assistant (basic), queries/callbacks
* **Premium User** – Extra tools (quiz generator, job suggestions, interview QnA), premium meetings, group chats, materials
* **Admin** – Full CRUD on users, jobs, courses, reviews, resumes, mentors, awards, and queries

---

 🔑 API Endpoints

* `/api/auth/` – Register/Login (OTP, Google)
* `/api/courses/` – Course CRUD
* `/api/services/` – Service CRUD
* `/api/jobs/` – Job listings & applications
* `/api/reviews/` – Review CRUD
* `/api/queries/` – Submit queries
* `/api/callbacks/` – Request callbacks
* `/api/tools/` – Gemini AI tools
* `/api/admin/` – Admin dashboard

---

 ⚙️ Installation & Setup

1. Clone repo

   ```bash
   git clone https://github.com/shanmukashanu/career.git
   cd career-main
   ```
2. Install dependencies

   ```bash
   npm install
   ```
3. Run frontend (React)

   ```bash
   npm run dev    # localhost:5173
   ```
4. Run backend (Express)

   ```bash
   node server.js # localhost:3000
   ```

---

 📄 Environment Variables (`.env` format)

```env
# MongoDB
MONGO_URI=your_mongodb_url

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=careerredefinee@gmail.com
EMAIL_PASSWORD=your_password
EMAIL_FROM="careerredefine <noreply@careerredefine.com>"

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Admin
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

---

 📧 Contact

For queries/support: **[careerredefinee@gmail.com](mailto:careerredefinee@gmail.com)**

