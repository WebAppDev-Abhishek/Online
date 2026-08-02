# PCB Online

Professional PCB design learning platform — free courses, phone+password auth, admin–student chat, and in-browser WebRTC voice calls.

## Stack

- **Next.js 16** (App Router) + **Tailwind CSS 4**
- **Prisma** + **SQLite** (swap to Postgres for production)
- **JWT** in httpOnly cookies (bcrypt password hashing)
- **Socket.io** for real-time chat & WebRTC signaling (`server.ts`)
- **jsPDF** for completion certificates

## Quick start

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For chat typing indicators + voice signaling:

```bash
npm run dev:socket
```

## Seeded admin

| Field    | Value         |
|----------|---------------|
| Phone    | `9999999999`  |
| Password | `Admin@123`   |

Change these via `.env` (`ADMIN_PHONE`, `ADMIN_PASSWORD`) before seeding.

## MVP features

1. PCB-themed homepage (hero, trust bar, courses, FAQ, WhatsApp CTA)
2. Register / login with 10-digit phone + password (no OTP)
3. Free course listing & lesson viewer (video / PDF / quiz)
4. Student dashboard — progress, chat, voice, certificates, alerts
5. Admin dashboard — courses, students, live chat, broadcasts, analytics
6. Real-time chat (REST + Socket.io) with pin/flag
7. WebRTC voice calls (browser-to-browser)
8. Auto certificate PDF on course completion

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js only |
| `npm run dev:socket` | Next.js + Socket.io custom server |
| `npm run db:seed` | Seed admin + sample courses |
| `npm run build` | Production build |

## Security notes

- Login/register rate-limited
- Admin routes guarded by middleware + RBAC
- Sessions via httpOnly cookies
- Phone format validated (`^[6-9]\d{9}$`); OTP can be added later

## Project layout

```
src/app/           # Pages + API routes
src/components/    # UI (Hero, Chat, Voice, dashboards)
src/lib/           # Auth, db, validation, certificates
prisma/            # Schema + seed
server.ts          # Custom server with Socket.io
```
