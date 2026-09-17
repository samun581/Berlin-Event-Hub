Berlin Event Hub

Berlin Event Hub is a full-stack event discovery and booking application developed for the M607 Computer Science Application Lab. It allows users to discover events in Berlin, create accounts, make and cancel bookings, and manage their profiles. Administrators can manage events, view bookings and statistics, and send event reminders.

Main Features

- Event discovery, search and filtering
- Event details with date, time, price, capacity and availability
- OpenStreetMap/Nominatim location integration
- User registration and login
- JWT-based authentication
- User and administrator roles
- Event booking and cancellation
- Duplicate, sold-out and past-event booking protection
- User dashboard and profile management
- Change password and forgot/reset password
- Admin event creation, editing and deletion
- Admin booking details and statistics
- Booking confirmation emails
- Password-reset emails
- Admin-triggered event reminder emails
- Responsive design for desktop, tablet and mobile

Technologies

Frontend:
Vue.js
Vite
HTML
CSS
JavaScript

Backend:
Node.js
Express.js
MongoDB
JWT
bcryptjs

External Services:
OpenStreetMap / Nominatim
SendGrid


Requirements

Before running the project, install:

- Node.js 22 LTS
- npm
- MongoDB Community Server 8.0
- MongoDB Shell (mongosh)


Installation

1. Open the project folder.

2. Install the main project dependencies:

npm install

3. Install the backend dependencies:

cd backend
npm install
cd ..

4. Make sure MongoDB is running.

You can test the MongoDB connection with:

mongosh


Environment Setup

Copy:

backend/.env.example

to:

backend/.env

Example:

JWT_SECRET=choose-a-private-local-secret
MONGO_URL=mongodb://127.0.0.1:27017
PORT=3000
APP_URL=http://localhost:5173
SENDGRID_API_KEY=
FROM_EMAIL=

JWT_SECRET, MONGO_URL and PORT are required.

SENDGRID_API_KEY and FROM_EMAIL are optional for local testing. They are required only for real SendGrid email delivery.

Never upload the real backend/.env file or API keys to GitHub.


Running the Application

From the main project folder, run:

npm run dev:all

The application normally runs at:

Frontend: http://localhost:5173
Backend: http://localhost:3000


Admin Access

Register a normal account through the application first.

To change the account to an administrator, open mongosh and run:

use berlin_event_hub

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)

Log out and log in again to access the administrator features.


Email Support

SendGrid is used for:

- Booking confirmation emails
- Password-reset emails
- Event reminder emails

The application can run without SendGrid. If SendGrid is not configured, development preview behaviour is used where supported.

For real email delivery, add a valid SENDGRID_API_KEY and verified FROM_EMAIL address to backend/.env.


Production Build

To create a production build:

npm run build

To start the production application:

npm start


Repository

GitHub Repository: https://github.com/samun581/Berlin-Event-Hub
