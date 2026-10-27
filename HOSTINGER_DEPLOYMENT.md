# Hostinger & MySQL Deployment Guide for Steven Imanzi Portfolio

This project is now configured to use a real **MySQL database** (`stevenimanzi_db`) with a fast PHP REST API backend, ready to run **offline locally** and deploy directly onto **Hostinger Shared/Cloud/VPS Web Hosting**.

---

## 1. Local Offline Development

Your local MySQL instance is already configured with:
* **Database Name**: `stevenimanzi_db`
* **Port**: `3306`
* **User**: `root`
* **Password**: `Enterin@12`
* **Admin Login**: `stivenimanzi1@gmail.com` / `Enterin@12`

### Running the Project Locally

To run both the PHP API and the Vite frontend:

1. **Terminal 1 (Backend API)**:
   ```bash
   npm run api
   ```
   *(Starts local PHP server on `http://localhost:8000`)*

2. **Terminal 2 (Frontend)**:
   ```bash
   npm run dev
   ```
   *(Vite dev server proxies `/api` requests to `localhost:8000` automatically)*

3. **Re-seeding Local Database** (if you ever need to reset to default content):
   ```bash
   npm run db:seed
   ```

4. **Exporting Local Database**:
   ```bash
   npm run db:export
   ```
   *(Generates a clean `database/hostinger_import.sql` ready for Hostinger)*

---

## 2. Deploying to Hostinger (Step-by-Step)

### Step 1: Create MySQL Database on Hostinger
1. Log in to your **Hostinger hPanel**.
2. Go to **Databases** → **Management**.
3. Create a new MySQL database:
   * **Database Name**: e.g., `u123456789_stevenimanzi` (Hostinger automatically prepends your account prefix)
   * **Username**: e.g., `u123456789_admin`
   * **Password**: e.g., `Enterin@12` (or a password of your choice)
4. Take note of the **Database Name**, **Username**, and **Password**.

---

### Step 2: Import the Database Schema & Data via phpMyAdmin
1. In Hostinger hPanel under **Databases**, click **Enter phpMyAdmin** next to your new database.
2. Click the **Import** tab at the top.
3. Under **File to import**, click **Choose File** and select:
   ```
   D:\Projects\stevenimanzi\database\hostinger_import.sql
   ```
4. Click **Go** at the bottom.
5. All 7 tables (`admins`, `services`, `projects`, `testimonials`, `settings`, `messages`, `visits`) and default content will be imported.

---

### Step 3: Build the Frontend
In your project directory, run:
```bash
npm run build
```
This builds everything into the `dist/` directory, including:
* The React app bundle (`dist/index.html`, `dist/assets/`)
* The complete PHP API (`dist/api/`)
* Apache `.htaccess` routing rules for Hostinger (`dist/.htaccess`)

---

### Step 4: Configure Database Credentials for Hostinger
Open `dist/api/config.php` (or edit it directly in Hostinger File Manager after uploading):
Change lines 24–27:
```php
$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_NAME = getenv('DB_NAME') ?: 'u123456789_stevenimanzi';  // Your Hostinger DB Name
$DB_USER = getenv('DB_USER') ?: 'u123456789_admin';         // Your Hostinger DB User
$DB_PASS = getenv('DB_PASS') !== false ? getenv('DB_PASS') : 'YOUR_HOSTINGER_DB_PASSWORD';
```

---

### Step 5: Upload to Hostinger `public_html`
1. In Hostinger hPanel, open **File Manager** (or connect via FileZilla / FTP).
2. Navigate to `public_html/`.
3. Upload all files and folders inside your local `dist/` folder directly into `public_html/`:
   ```
   public_html/
   ├── .htaccess
   ├── index.html
   ├── robots.txt
   ├── sitemap.xml
   ├── api/
   │   ├── config.php
   │   ├── auth.php
   │   ├── content.php
   │   ├── messages.php
   │   └── visits.php
   └── assets/
       ├── ... (js, css, images)
   ```

---

## 3. Verifying Your Live Deployment

* **Website**: Visit `https://yourdomain.com` (All services, projects, testimonials load directly from MySQL).
* **Contact Form**: Test sending a message at `/contact` — it inserts directly into the `messages` table.
* **Admin Dashboard**: Open `https://yourdomain.com/admin`:
  * **Email**: `stivenimanzi1@gmail.com`
  * **Password**: `Enterin@12` (or whatever password you set in the `admins` table)
  * Manage projects, services, testimonials, view visitor analytics & map, and read contact messages!
