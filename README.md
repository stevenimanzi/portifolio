# Steven Imanzi - Professional Portfolio

Official portfolio and client platform for **Steven IMANZI** — Full-Stack Software Developer based in Kigali, Rwanda.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Modular CSS, Framer animations, responsive layouts
- **Backend API:** PHP 8+ REST API (`public/api/`)
- **Database:** MySQL (`stevenimanzi_db`)
- **Cloud & Analytics:** Firebase Auth & Firestore (dual-mode sync), Leaflet maps
- **PDF Viewer:** React-PDF for verified academic and technical certifications

---

## Getting Started

### 1. Requirements
- Node.js 18+ & npm
- PHP 8.2+ with PDO MySQL extension
- MySQL 8.0+

### 2. Local Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/stevenimanzi/portifolio.git
   cd portifolio
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Start backend API:**
   ```bash
   npm run api
   ```
   *(Runs on `http://localhost:8000`)*

4. **Start Vite development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## Database Configuration

Local MySQL development defaults:
- **Database:** `stevenimanzi_db`
- **User:** `root`
- **Host:** `127.0.0.1`

Schema and seed data are maintained in:
- `database/schema.sql`
- `database/stevenimanzi_db.sql`
