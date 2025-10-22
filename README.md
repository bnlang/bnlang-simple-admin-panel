# Bnlang Simple Admin Panel

A minimal, ready-to-run admin panel built with Bnlang (Bangla Programming Language), using RouteOn for routing, SQLite for persistence, and AdminLTE for UI.

https://github.com/bnlang/bnlang-simple-admin-panel

---

## Features

- Login/logout flow with cookie-based session
- Auth middleware guarding `/admin/*` routes
- Admin dashboard scaffold (AdminLTE theme)
- SQLite database with auto-migration and seed
- XHR-friendly responses (JSON + redirect hints)

---

## Tech Stack

- Bnlang runtime (`bnl`)
- Routing: `route-on`
- Cookies: `route-on-cookies`
- Database: `bnlang-sqlite` (SQLite)
- UI: AdminLTE, Bootstrap, jQuery (served from `public/`)

---

## Getting Started

### Prerequisites

- Bnlang and BPM installed (provides the `bnl` and `bpm` CLIs)

### Install

If dependencies are not already present:

```bash
bpm install
```

### Run

```bash
bnl index.bnl
```

Open http://localhost:3000

---

## Default Admin

On first run, the database is created and a default admin is seeded:

- Email: `admin@example.com`
- Password: `admin123`

Change these in `data.sqlite` or update via SQL once logged in.

---

## Project Structure

```
bnlang-simple-admin-panel/
├─ index.bnl                 # App entrypoint, routes hookup
├─ db.bnl                    # SQLite connection + setup/seed
├─ routes/
│  ├─ login.bnl              # GET /, POST /login
│  └─ admin/
│     ├─ dashboard.bnl       # GET /admin/dashboard
│     └─ logout.bnl          # GET /admin/logout
├─ middleware/
│  └─ auth.middleware.bnl    # Session/auth guard
├─ views/
│  ├─ index.bhtml            # Login page
│  └─ admin/
│     ├─ dashboard.bhtml     # Dashboard view
│     └─ layouts/            # Header/footer (AdminLTE)
├─ public/                   # CSS/JS/assets (AdminLTE, jQuery, Bootstrap)
├─ data.sqlite               # SQLite DB file (auto-created)
└─ bnl_package.json          # Project metadata and scripts
```

---

## Routes

- `GET /` → Login page
- `POST /login` → Authenticate; sets `user` cookie; JSON response with optional `redirect`
- `GET /admin/dashboard` → Protected dashboard
- `GET /admin/logout` → Clears cookie and redirects to `/`

Middleware: `middleware/auth.middleware.bnl`

- Redirects unauthenticated `/admin/*` requests to `/`
- Prevents visiting `/` when already logged in (redirects to dashboard)
- Loads `auth_user` into `res.locals` for views

---

## Configuration Notes

- Port: `3000` (see `index.bnl` → `app.listen(3000)`)
- Static assets: served from `public/`
- Views: `bhtml` engine, templates in `views/`
- Cookies: `route-on-cookies` is initialized with a fixed secret; the `user` cookie itself is not signed in this demo

Database initialization (in `db.bnl`):

- Creates `admins` table if missing
- Seeds the default admin when table is empty

---

## Security Considerations

This project is intended as a simple demo. For production:

- Store password hashes (e.g., bcrypt) instead of plaintext
- Sign or encrypt session cookies; consider rotating secrets
- Add CSRF protection to form submissions
- Validate and rate-limit login attempts

---

## Development Tips

- To reset the admin, delete `data.sqlite` and restart, or update the `admins` table directly:

```sql
UPDATE admins SET email = 'you@example.com', password = 'change-me' WHERE id = 1;
```

- Adjust the cookie secret in `index.bnl` where `cookieParser("...")` is configured.

---

## License

MIT

Author: Bnlang
