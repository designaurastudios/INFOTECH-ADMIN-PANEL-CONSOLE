# Dental HMS — Cloud Admin & Licensing Command Center

This is the private cloud dashboard for the **Dental HMS software vendor**. It is completely separate from the clinic software and is never shared with clients.

---

### Features

1. **1-Click Lifetime Key Generator:**
   - Input Client Clinic Name, Doctor Name, Phone, and the Client's Server Machine ID.
   - Instantly generates the signed Lifetime License Key and ready-to-send WhatsApp welcome message.

2. **Clinic Directory & Live Tracker:**
   - View all sold copies, their hardware Machine IDs, and connection status.
   - Live Status Badge: `ACTIVE` vs `SUSPENDED` vs `REVOKED`.

3. **Master Remote Controls:**
   - **Suspend / Reactivate:** Pause any clinic's software remotely with 1 click.
   - **Hardware Device Transfer:** Clear bound Machine ID when a clinic buys a new server PC.

4. **Remote Developer Settings:**
   - **Staff Management Toggle:** Remotely allow or block administrators in a clinic from managing staff.
   - **Emergency Director Password Reset:** Remotely issue a new master password for the clinic's Primary Director (Owner).
   - **Director Notification Email:** Update the Director's notification email remotely.

---

### How to Run Locally

1. Open a terminal in this folder:
   ```bash
   cd "H:\DENTAL HMS CLOUD ADMIN"
   npm install
   npm run dev
   ```
2. Open your browser at `http://localhost:5180`.
3. In local demo mode, sign in with:
   - **Email:** `admin@dentalhms.com`
   - **Password:** `admin123`

---

### Connecting to Live Firebase Cloud (100% Free Spark Plan)

1. Go to [Firebase Console](https://console.firebase.google.com) and create a free project.
2. Under **Build**, enable:
   - **Authentication:** Turn on Email/Password provider.
   - **Firestore Database:** Create database (Start in production or test mode).
3. Under Project Settings -> **General**, create a Web App and copy your config.
4. Create a `.env` file in this folder:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-app
   VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456:web:...
   ```
5. Deploy to free Firebase Hosting (accessible on your smartphone from anywhere):
   ```bash
   npm run build
   npx firebase-tools init hosting
   npx firebase-tools deploy --only hosting
   ```

