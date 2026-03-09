# BuildCore - Construction Workforce Management Platform

A comprehensive, scalable, multi-tenant enterprise application designed to manage construction workforce, projects, sites, attendance, payroll, and communications.

## 🚀 Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Session-based, Role-Based Access Control)

## 📋 Features Implemented

### 1. User Authentication & Authorization
- **Role-Based Access Control**: Supported roles include `OWNER`, `ADMIN`, `SUB_MANAGER`, and `WORKER`.
- Dynamic Sidebar Navigation that adapts based on the logged-in user's role.
- Protected API routes and layout components.

### 2. Dashboard Components
- **Public Homepage**: Dynamic integration pulling active projects and company information directly from the database to present real-time insights to visitors.
- **Users & Access**: Management interface to add and assign roles to users.
- **Sites & Projects**: Management for construction sites and associated projects.
- **Workforce / HR**: Profile management for workers (skills, wage, emirates ID).
- **Attendance**: GPS & Photo-verified attendance tracking for workers across different sites.
- **Payroll**: Automated payroll generation, tracking base salary, overtime, deductions, and payment requests.

### 3. Document Management System (Secure Vault)
- **Role-Based Visibility**: Users can upload and access documents securely based on their clearance. 
- **Targeted Sharing**: Documents can be shared specifically via `recipientId` to individual users, or via `targetRole` (e.g., "ALL WORKERS").
- **Document Types**: Support for multiple types including `CONTRACT`, `ID_COPY`, `PROJECT_DOC`, `PAYROLL_REPORT`, `NOTICE`, `INSTRUCTION`, `REPORT`, and `ADVICE`.

### 4. Advanced Messaging & Communications
- **Hierarchical Chat System**: Users can message others based on a strict organizational hierarchy (e.g., Workers can only message Sub-Managers; Sub-Managers can message Admins and Owners).
- **Multimedia Attachments**: Support for sending images (`.jpg`, `.png`), video (`.mp4`), and audio files (`.mp3`, `.wav`) mapped to cloud storage (simulated locally).
- **Voice Notes**: Built-in functionality using the browser's `MediaRecorder` API allowing users to record and send live voice memos directly in the chat interface.

## 🛠️ Development & Implementation Process

The project is developed iteratively with the following workflow:

1. **Requirements Gathering**: Defining schema models such as `User`, `Company`, `Site`, `Project`, `WorkerProfile`, `Attendance`, `Payroll`, `PaymentRequest`, `Document`, and `Message`.
2. **Database & Schema Modification**: Using `prisma/schema.prisma` as the single source of truth for the database and generating models via `npx prisma generate` & `npx prisma db push`.
3. **Secure API Development**: Creating Next.js Route Handlers (`app/api/...`) to handle CRUD operations securely and parse standard JSON as well as `multipart/form-data` for file attachments.
4. **UI/UX Construction**: Building modern, beautifully responsive interfaces using Tailwind CSS with reusable React components (e.g., Sidebar, Chat window, Document Vault) and dynamic rendering mapping to data payloads.

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database instance

### Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables in a `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/buildcore"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # For Google OAuth Sign In (Optional but recommended)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

### 🔐 How to configure Google Sign-In (OAuth)
To enable users to sign in with their Google accounts, you will need to generate OAuth credentials using the Google Cloud Console. Follow these steps:

1. **Visit the Google Cloud Console**: Go to [console.cloud.google.com](https://console.cloud.google.com/).
2. **Create a Project**: Click the dropdown at the top navigation bar and select **"New Project"**. Name it `BuildCore` (or similar) and click Create.
3. **Configure the OAuth Consent Screen**:
   - In the left sidebar, navigate to **APIs & Services** > **OAuth consent screen**.
   - Choose **External** (if you want any Google user to be able to sign in) or Internal (if restricted to a specific Google Workspace).
   - Fill in the required fields (App name, User support email, Developer contact email). The rest can be left blank for development.
   - Click "Save and Continue" through the remaining steps.
4. **Create Credentials**:
   - In the left sidebar, click on **Credentials**.
   - Click **"+ CREATE CREDENTIALS"** at the top and select **"OAuth client ID"**.
   - Set the Application type to **"Web application"**.
   - Name the credential (e.g., `NextAuth Login`).
   - Under **Authorized redirect URIs**, add exactly this URL for local development:
     `http://localhost:3000/api/auth/callback/google`
   - Click **Create**.
5. **Add Keys to `.env`**:
   - A modal will appear displaying your **Client ID** and **Client Secret**.
   - Copy these values and paste them into your project's `.env` file as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
6. Restart your Next.js development server (`npm run dev`).

### 📱 How to configure SMS Delivery (Vonage)
To actually deliver the 6-digit OTP codes to real mobile devices globally during the "Forgot Password" flow, the system utilizes Vonage (formerly Nexmo). Follow these steps to activate it:

1. **Visit Vonage**: Go to [vonage.com/communications-apis/](https://www.vonage.com/communications-apis/) and create a free developer account.
2. **Access Dashboard**: Once logged in, you will be taken to the Vonage API Dashboard.
3. **Copy your Credentials**: 
   - Right on the top of your dashboard, you will find your **API key** and **API secret**.
   - Edit your project's `.env` file and replace the placeholder values:
     ```env
     VONAGE_API_KEY="your_vonage_api_key"
     VONAGE_API_SECRET="your_vonage_api_secret"
     VONAGE_BRAND_NAME="BuildCore" # The Alpha-numeric sender ID that appears on the user's phone (if supported in their region)
     ```
4. **Test Numbers**: While on the free tier, Vonage allows you to whitelist specific phone numbers that you are allowed to send messages to safely. Add your personal phone number on their dashboard.
5. Restart your Next.js development server (`npm run dev`).

---

4. Push the schema to your database (if you haven't already):
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
