# EventHub — Campus Event Ticketing System

A full-stack event management system built with **React + Vite + Supabase**.

---

## 🚀 Setup Instructions

### 1. Create a Supabase Project
- Go to [supabase.com](https://supabase.com) and create a new project
- Copy your **Project URL** and **anon public key** from Settings > API

### 2. Run the Database Schema
- In your Supabase dashboard, open the **SQL Editor**
- Paste and run the contents of `supabase_schema.sql`

### 3. Configure Environment Variables
- Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
- Fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install & Run
```bash
npm install
npm run dev
```

---

## 👤 Account Types

### Admin
- Full access: create/edit/delete events, view all registrations, manage users, QR check-in desk
- **Admin Code for registration:** `EVENTHUB2024`

### User
- Browse published events, register, view QR tickets, track check-in status

---

## ✨ Features

| Feature | Details |
|---|---|
| Authentication | Login / Register with Supabase Auth |
| Role-based access | Admin vs User with route protection |
| Event Management | Create, edit, delete, publish events |
| QR Tickets | Auto-generated QR code per registration |
| QR Scanner | Camera-based scanner on Check-In Desk |
| Manual Check-in | Enter ticket codes by hand |
| Dashboard | Stats overview for both roles |
| Registrations | Full table with check-in timestamps |

---

## 🗂 Project Structure

```
src/
├── context/AuthContext.jsx   # Auth state + Supabase auth
├── hooks/useToast.js         # Toast notifications
├── lib/supabase.js           # Supabase client
├── components/
│   ├── Layout.jsx            # Wrapper with sidebar
│   ├── Sidebar.jsx           # Navigation sidebar
│   └── Toast.jsx             # Toast component
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── admin/
    │   ├── Dashboard.jsx
    │   ├── ManageEvents.jsx
    │   ├── EventForm.jsx
    │   ├── EventDetail.jsx
    │   ├── Registrations.jsx
    │   ├── Users.jsx
    │   └── CheckIn.jsx
    └── user/
        ├── UserDashboard.jsx
        ├── BrowseEvents.jsx
        └── MyTickets.jsx
```
