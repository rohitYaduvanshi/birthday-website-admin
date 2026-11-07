# 🎈 Interactive Birthday Wish Website with Admin Panel

A premium, interactive 3D birthday wish website built with Next.js (App Router), React, Tailwind CSS, Framer Motion, and Three.js. Includes a **full Admin Panel** so anyone can customize all photos, music, countdown date, messages, and captions for any person without writing code!

---

## 🔗 GitHub Repository
👉 [https://github.com/rohitYaduvanshi/birthday-website-admin](https://github.com/rohitYaduvanshi/birthday-website-admin)

---

## 🚀 How to Run Locally

### 1. Dependencies Install (if not done already)
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```

### 3. Open in Browser
- **Main Birthday Website**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel (Protected)**: [http://localhost:3000/admin](http://localhost:3000/admin)
  - **Default PIN**: `1111` (Can be changed in the admin panel settings tab)

---

## 🛠️ Admin Panel Features (`/admin`)

When you visit `/admin`, enter the PIN (`1111`) to access the dashboard:

1. **👤 Person & Name**
   - Person's Name, Nickname
   - Hero Badge (e.g. `Aug 5`, `Nov 11`)
   - Custom Hero Wish Message

2. **⏳ Countdown & Curtain**
   - Target Birthday Date & Time (IST format supported)
   - Marquee Title (e.g. `NOW SHOWING`)
   - Subtitle & Doors announcement
   - Toggle preview button on/off

3. **🎵 Music & Song**
   - Upload your own `.mp3` directly or enter a URL
   - Set Song Title & Artist name

4. **🖼️ 12 Photos Gallery**
   - Photo 0: Scrapbook Heart photo
   - Photos 1-11: Girl / Person's photo memories
   - One-click upload with instant live preview

5. **📝 Notes & Captions**
   - Floating Butterfly Notes (titles & text)
   - Draggable Polaroid Gallery captions
   - 3D Galaxy Stellar Cards titles

6. **💬 iMessage Finale**
   - Chat Avatar & Profile Name
   - Customize final iMessage chat bubbles line-by-line

7. **⚙️ Security & Settings**
   - Change Admin Access PIN
   - Export Config JSON (backup)
   - Import Config JSON
   - Reset to default settings

---

## 🔒 Sharing with the Birthday Person

When sharing the website with the birthday recipient:
- Send them only the main link: `https://your-domain.com/` (or `http://localhost:3000`)
- **Do NOT** share `/admin` with them.
- They will only see the beautiful birthday experience with your customized photos, song, and messages.

---

## 🌐 Free Deployment (Vercel)

1. Fork or push this repository to your GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import `birthday-website-admin`.
4. Click **Deploy**.
5. Your live link is ready to share!
