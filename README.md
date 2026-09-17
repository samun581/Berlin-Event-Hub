# Berlin Event Hub

Berlin Event Hub is a full-stack event discovery and booking application for the M607 Computer Science Application Lab.

## Requirements

Install before the first run:

- **Node.js 22 LTS** (22.18.0 or newer 22.x recommended)
- **npm** (included with Node.js)
- **MongoDB Community Server 8.0**
- **MongoDB Shell (`mongosh`)**
- A modern browser

Check installation:

```bash
node -v
npm -v
mongosh --version
```

## 1. Start MongoDB

MongoDB must be running before the app starts.

**macOS (Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community@8.0
brew services start mongodb-community@8.0
mongosh
```

**Windows:** install MongoDB Community Server as a Windows service, then test:

```powershell
mongosh
```

If needed, start it from Administrator PowerShell:

```powershell
Start-Service MongoDB
```


**Linux:** install MongoDB Community Server and `mongosh` using MongoDB's official instructions for your distribution, start the MongoDB service, then run `mongosh`.

Type `exit` to leave `mongosh` after the connection test.

## 2. Install project dependencies

Extract the ZIP fully and open the main project folder. Do not copy `node_modules` from another computer.

```bash
npm install
cd backend
npm install
cd ..
```

## 3. Create `backend/.env`

Copy `backend/.env.example` to `backend/.env`.

macOS/Linux:

```bash
cp backend/.env.example backend/.env
```

Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Example:

```text
JWT_SECRET=choose-a-private-local-secret
MONGO_URL=mongodb://127.0.0.1:27017
PORT=3000
APP_URL=http://localhost:5173
SENDGRID_API_KEY=
FROM_EMAIL=
```

`SENDGRID_API_KEY` and `FROM_EMAIL` are optional for local testing. With them blank, email actions use development preview mode. For **real SendGrid delivery**, create an API key with Mail Send permission, verify the sender address in SendGrid, add both values to `backend/.env`, then restart the app. Never commit the real `.env` file.

## 4. Run the application

From the main project folder:

```bash
npm run dev:all
```

Normally:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`

Open the exact Local URL shown by Vite. If Vite uses another port (for example 5174), update `APP_URL` in `backend/.env` before testing password-reset links and restart the app.

## 5. First-time data and admin access

The database is created automatically. Register a normal user in the website first. To promote that user to admin:

```bash
mongosh
```

```javascript
use berlin_event_hub

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Then type `exit`, log out of the website and log in again.

## Email behaviour

The project supports SendGrid for:

- automatic booking-confirmation email after a successful booking;
- password-reset email from **Forgot password?**;
- manual admin-triggered event reminder email.

If SendGrid is not configured, the same flows remain testable through safe development previews in the backend terminal (and a development reset link for Forgot Password). Event reminders are manual, not automatically scheduled.

## Main features

- Public event discovery, search and filtering
- Event details and OpenStreetMap/Nominatim location map
- Registration, login, JWT and user/admin roles
- Strong password and profile validation
- Booking, availability, duplicate/sold-out/past-event protection
- Booking cancellation for future events
- User profile, change password and forgot/reset password
- Admin event CRUD, booking details and statistics
- SendGrid email support and manual reminders
- Responsive desktop/tablet/mobile layout

## Troubleshooting

**MongoDB connection error:** run `mongosh`. If it cannot connect, start the MongoDB service first.

**`npm run dev:all` says script missing:** return to the main project folder (not `backend`) and run it again.

**Missing environment error:** confirm `backend/.env` exists and contains `JWT_SECRET`, `MONGO_URL` and `PORT`.

**Vite/Rolldown native binding error:** delete `node_modules` and reinstall on that computer. Do not copy `node_modules` between machines.

**No real email received:** real email requires both `SENDGRID_API_KEY` and a verified `FROM_EMAIL`. Otherwise preview mode is intentional.

## Production build

```bash
npm run build
npm start
```

For deployment, use production environment variables and a production-accessible MongoDB database. Do not upload `backend/.env`.

## Submission links

GitHub Repository: **TO BE ADDED**

Deployed Application: **TO BE ADDED**
