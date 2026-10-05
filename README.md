# Insurance Fraud Intelligence & Investigation Platform (POC)

A production-mirror proof of concept demonstrating that modern insurance fraud detection must analyze **multi-entity network connections and historical filing velocity**, rather than evaluating individual claims in isolation.

---

## 1. Executive Summary & Proposal Answer

### The Core Problem in Insurance Today
Traditional fraud screening systems inspect claims in isolation. An analyst evaluates a claim based solely on the documents submitted for that single incident. If a claim appears reasonable on paper (for example, a ₹4,60,000 auto accident with an itemized repair estimate), standard rules approve it.

However, **organized insurance fraud is almost never a single isolated event**. Fraud rings systematically coordinate:
- Different individuals file separate claims on different dates.
- All payouts are funneled into the **same bank accounts**.
- All repairs or medical treatments are routed through the **same complicit repair shops or clinics**.
- Policies are purchased shortly before staged accidents occur.

### Our Solution
**FraudSentinel Intelligence** proves that effective fraud detection requires a **3-dimensional intelligence model**:
1. **Claim-Level Signals**: Does the claim amount exceed 70% of coverage? Was the policy purchased less than 90 days ago?
2. **Claimant Velocity**: Has this customer filed $\ge 3$ claims in the past 12 months?
3. **Cross-Entity Relationships**: Is the payout bank account shared with other claimants? Is the repairing garage a statistical billing outlier?

### The Cardinal Rule: Human in the Loop
Algorithms calculate **suspicious risk indicators**; **only a human investigator can mark a claim as "Confirmed Fraud" or "Cleared"**. This ensures full legal and regulatory compliance.

---

## 2. Tech Stack & Why Each Tool Was Selected

| Layer | Technology | Engineering Rationale |
|---|---|---|
| **Frontend Framework** | **React 18 + Vite** | Blazing-fast HMR dev server, instant builds, modern component architecture. |
| **Styling** | **Tailwind CSS** | Clean design system, custom responsive layout, zero CSS bloat, no clunky UI library dependencies. |
| **Routing** | **React Router v6** | Declarative client routing with protected routes and clean URL states (`/claims/:claimId`). |
| **Graph Visualization** | **React Flow (`@xyflow/react`) + Dagre** | Interactive canvas with automatic hierarchical layout for multi-entity relationship discovery. |
| **Icons & UI Elements** | **Lucide React** | Consistent, accessible enterprise iconography. |
| **API Client** | **Axios** | Configured with `withCredentials: true` for secure HTTP-only cookie authentication. |
| **Backend Runtime** | **Node.js + Express** | Lightweight, high-throughput REST API with clean modular routing. |
| **Database** | **MongoDB Atlas + Mongoose** | Flexible document store for claims with embedded policy and customer snapshots. Connected via dedicated user. |
| **Authentication** | **JWT via HTTP-Only Cookies** | Secure, XSS-resistant session management (`bcrypt` password hashing, `sameSite: "lax"`, `httpOnly: true`). |
| **E2E Testing** | **Playwright** | Full browser automation test suite orchestrating both backend (`:3001`) and frontend (`:5173`). |

---

## 3. Engineering Challenges Faced & How We Solved Them

1. **Explainability vs. Black-Box Machine Learning**:
   - *Challenge*: Machine learning models (e.g. XGBoost, Random Forests) output probabilities that cannot easily be defended in court or regulatory audits when an insurer denies a claim.
   - *Solution*: Built a **deterministic 5-rule scoring engine** with itemized point weights and human-readable evidence strings. Every score is 100% auditable.

2. **Preventing False Positives on Honest High-Value Claims**:
   - *Challenge*: Naive rules flag every large claim as suspicious, harassing legitimate policyholders.
   - *Solution*: Conditioned the high-amount rule on both policy coverage ratio (>70%) AND provider billing multiplier (>2.0x). For example, claim `CLM-005` (Ananya Sharma) has an ₹8.5L claim, but long tenure and a unique account, yielding a **Low Risk (15 pts)** score.

3. **Graph Relationship Discovery Without Database Bloat**:
   - *Challenge*: Using dedicated graph databases (like Neo4j) adds heavy operational overhead for a time-boxed POC.
   - *Solution*: Indexed `paymentAccountId` and `providerId` in MongoDB. Graph generation queries find shared entities in single-digit milliseconds, passing nodes and edges to `@xyflow/react` and `@dagrejs/dagre` on the client.

4. **Guaranteed Zero-Blast-Radius Database Isolation**:
   - *Challenge*: Reusing the existing MongoDB Atlas cluster without risking any cross-database contamination with existing applications (like Orbit).
   - *Solution*: Created a dedicated database user scoped exclusively with `readWrite` permissions on `insurance-fraud-poc`. Orbit remains 100% untouched.

5. **Asynchronous Case State Management**:
   - *Challenge*: Ensuring investigation notes, case status changes, and explicit outcomes persist reliably across browser reloads.
   - *Solution*: Implemented an atomic `PATCH /api/investigations/:claimId` endpoint storing case notes with author attribution and ISO timestamps directly in MongoDB.

---

## 4. The 6 APIs Explained from First Principles

### 1. `POST /api/auth/login`
- **What it does in simple words**: Verifies who the analyst is.
- **Inputs**: `{ email, password }`
- **Logic**: Compares password with `bcrypt` hash in MongoDB. Generates a signed JWT token and attaches it to an HTTP-only response cookie (`token`).
- **Returns**: `{ message: "Authentication successful", user: { name, email, role } }`

### 2. `POST /api/auth/logout`
- **What it does in simple words**: Signs the analyst out.
- **Logic**: Expires the `token` cookie immediately (`expires: 0`).
- **Returns**: `{ message: "Logged out successfully" }`

### 3. `GET /api/dashboard`
- **What it does in simple words**: Powers the main triage screening queue.
- **Logic**: Loads all claims and providers, runs each claim through `analyzeRisk()`, merges any active investigation statuses, and sorts the claims from highest risk to lowest risk.
- **Returns**:
  ```json
  {
    "stats": { "totalClaims": 25, "highRisk": 5, "mediumRisk": 8, "openInvestigations": 2 },
    "claims": [ { "claimId": "CLM-003", "customerName": "...", "claimAmount": 460000, "riskScore": 65, "riskLevel": "MEDIUM", "topReason": "..." } ]
  }
  ```

### 4. `GET /api/claims/:claimId`
- **What it does in simple words**: Assembles the complete intelligence file for a single claim.
- **Logic**:
  1. Finds the target claim.
  2. Runs the 5-rule risk engine for transparent signal breakdowns.
  3. Queries past claims by the same claimant (`customerHistory`).
  4. Fetches provider billing benchmarks (`providerStats`).
  5. Queries other claims sharing the same bank account or provider (`relatedClaims`).
  6. Fetches active case notes and outcomes (`investigation`).
- **Returns**: Unified JSON payload powering all sections of the detail page.

### 5. `GET /api/claims/:claimId/relationships`
- **What it does in simple words**: Builds the network map for the React Flow visualizer.
- **Logic**: Creates node objects for the Target Claim, Claimant, Provider, and Payout Account. Finds connected claims sharing those accounts or providers, and creates directional edges (`"Filed Claim"`, `"Treated / Serviced"`, `"Shared Payout Acct"`).
- **Returns**: `{ nodes: [...], edges: [...] }`

### 6. `PATCH /api/investigations/:claimId`
- **What it does in simple words**: Updates the human investigator's case file.
- **Inputs**: `{ status, note, outcome }`
- **Logic**: Upserts the `Investigation` document in MongoDB. Pushes new notes into the `notes` array with author name and timestamp. Stores final outcome text when confirmed or cleared.
- **Returns**: `{ message: "Investigation updated successfully", investigation: { ... } }`

---

## 5. Screen-by-Screen & Section-by-Section Guide

### Screen 1: Login Page (`/login`)
- **Branding**: Clean header with "Insurance Fraud Intelligence".
- **Demo Access**: One-click **"Use Demo Account"** button pre-fills `analyst@demo-insurance.com` / `demo123` so any reviewer can log in instantly without typing.

### Screen 2: Claims Queue Dashboard (`/`)
- **Top Summary Cards**:
  - *Total Screened Claims*: Total claims in the system (25).
  - *High Risk Claims*: Count of claims scoring $\ge 70$ (Investigation Recommended).
  - *Medium Risk Claims*: Count of claims scoring $40 - 69$ (Review Recommended).
  - *Active Case Files*: Count of open or actively investigated cases.
- **Interactive Triage Queue Table**:
  - Displays claims ranked from highest risk score to lowest.
  - Columns: **Claim ID**, **Claimant**, **Type**, **Claim Amount**, **Risk Score**, **Risk Severity**, **Primary Suspicious Indicator**, **Case Status**, and **Action**.
  - Quick filter buttons (*All, High Risk, Medium Risk, Low Risk*) and real-time search.

### Screen 3: Claim Intelligence & Case File (`/claims/:claimId`)
When an analyst inspects a claim (e.g. `CLM-003` - Vikram Malhotra):

1. **Header & Risk Wheel**:
   - Circular score indicator displaying the 0-100 score with the label `"High Risk — Investigation Recommended"`.
2. **"Why was this claim flagged?" (Explainability Section)**:
   - Evaluates all 5 deterministic suspicious indicators:
     - 🕒 *Recent Policy Inception*: Policy active for $\le 90$ days before incident (+15 pts).
     - 💰 *Disproportionate Claim Amount*: Claim > 70% coverage AND > 2x provider avg (+20 pts).
     - 🔄 *Frequent Claimant History*: Customer filed $\ge 3$ claims in past 12 months (+15 pts).
     - 🏢 *Provider Billing Outlier*: Provider average bill > 1.5x system baseline (+20 pts).
     - 🔗 *Shared Payment Entity*: Bank payout account is shared across different claimants (+30 pts).
3. **Claim & Policy Details**:
   - Incident type, claim amount, total coverage, policy start date, incident date, and payout account ID.
4. **Provider Profile (Garage / Hospital)**:
   - Shows the servicing repair shop or clinic, their overall claim count, and their average billing vs. system benchmark.
5. **Claimant Filing History (Past Claims by This Person)**:
   - Displays all previous claims filed by this customer to identify frequency/velocity abuse.
6. **Linked Claims (Shared Account or Provider)**:
   - Immediately alerts the analyst to other claims linked to the same bank account or garage.
7. **Entity Connection Map (Fraud Ring Visualizer)**:
   - Interactive React Flow canvas powered by Dagre auto-layout.
   - Visually reveals the fraud ring: `CLM-003` (Vikram) and `CLM-020` (Sunita) connect to the **same red bank account node (`ACCT-7890`)** and the **same provider node (`PROV-003`)**.
8. **Investigator Case File & Action Panel**:
   - Status badge (`Open`, `Under Investigation`, `Cleared`, `Confirmed Fraud`).
   - Action buttons:
     - **Start Investigation**: Opens the active case file.
     - **Clear Claim**: Prompts for outcome justification and marks claim cleared.
     - **Confirm Fraud**: Prompts for evidence summary and marks confirmed fraud.
   - **Add Case Note**: Note input saving analyst observations.
   - **Case Activity Timeline**: Chronological log of all analyst notes with timestamps. Persisted directly in MongoDB.

---

## 6. How to Run the Application

### 1. Start Both Servers Concurrently
From the project root:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

### 2. Re-Seed Synthetic Data (Optional)
To reset the MongoDB Atlas database to its initial state:

```bash
npm run seed
```

### 3. Run Automated Playwright Tests

```bash
# Headless run:
npm run test:e2e

# Visual (browser opens on screen):
npx playwright test --headed

# Interactive visual test UI:
npm run test:e2e:ui
```