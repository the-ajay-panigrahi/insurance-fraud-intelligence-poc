# Insurance Fraud Intelligence & Investigation POC

A full-stack intelligence and investigation platform demonstrating that insurance fraud detection must analyze multi-entity relationships and historical signals rather than assessing isolated claims.

---

## Tech Stack

- **Frontend**: React 18, Vite, JavaScript, Tailwind CSS, React Router v6, `@xyflow/react` (React Flow), `@dagrejs/dagre`, Lucide Icons, Axios
- **Backend**: Node.js, Express, JavaScript, Mongoose, JWT (HTTP-only cookies), `bcrypt`
- **Database**: MongoDB Atlas (`insurance-fraud-poc` database with dedicated scoped user)
- **Testing**: Playwright End-to-End Test Suite

---

## Quick Start

### 1. Start Both Frontend and Backend

From the project root directory, run:

```bash
npm run dev
```

This starts:
- **Backend API**: `http://localhost:3001`
- **Frontend App**: `http://localhost:5173`

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## Demo Credentials

Click the **"Use Demo Account"** button on the login screen, or sign in manually with:

- **Email**: `analyst@demo-insurance.com`
- **Password**: `demo123`

---

## Available Scripts

From the project root:

| Command | Description |
|---|---|
| `npm run dev` | Runs both backend (`:3001`) and frontend (`:5173`) concurrently |
| `npm run seed` | Re-seeds the MongoDB Atlas `insurance-fraud-poc` database |
| `npm run test:e2e` | Runs Playwright end-to-end integration tests in headless mode |
| `npm run test:e2e:ui` | Runs Playwright test runner with interactive visual UI |
| `npm run dev:server` | Runs backend only (`:3001`) with nodemon |
| `npm run dev:client` | Runs frontend only (`:5173`) with Vite |

---

## Key Features & Walkthrough Flow

1. **Automated Triage Screening**:
   - 4 summary metrics: Total claims, High Risk, Medium Risk, Active Investigations.
   - Claims ranked by a deterministic 0-100 risk score based on 5 explainable suspicious indicator rules.
   - Filtering by risk severity and real-time search across claimants, providers, and accounts.

2. **Transparent Explainability ("Why was this claim flagged?")**:
   - Click on any high-risk claim (e.g. `CLM-003`).
   - Full audit breakdown showing every rule evaluated, points awarded, and human-readable justification.

3. **Multi-Entity Relationship Graph**:
   - Interactive React Flow network with automatic Dagre layout.
   - Visually reveals coordinated fraud rings connecting multiple claimants through shared bank payout accounts (`ACCT-7890`) and billing outlier repair shops (`PROV-003`).

4. **Human Investigation & Case File**:
   - Automated signals flag suspicion; human investigators make final determinations.
   - Click **"Start Investigation"** to open a case file.
   - Add analytical notes with automatic timestamp and author attribution.
   - Record explicit final determinations (**Clear Claim** or **Confirm Fraud**) with full justification.
   - Case notes and status remain fully persisted in MongoDB upon page reload.