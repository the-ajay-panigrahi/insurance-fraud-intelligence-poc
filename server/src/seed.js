require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("./database");

const User = require("./models/User");
const Claim = require("./models/Claim");
const Provider = require("./models/Provider");
const Investigation = require("./models/Investigation");

async function seedData() {
  try {
    console.log("Connecting to database for seeding...");
    await connectDB();

    console.log(`Clearing existing collections in ${mongoose.connection.name}...`);
    await Promise.all([
      User.deleteMany({}),
      Claim.deleteMany({}),
      Provider.deleteMany({}),
      Investigation.deleteMany({}),
    ]);

    // 1. Seed Demo Analyst User
    console.log("Seeding Analyst user...");
    const passwordHash = await bcrypt.hash("demo123", 10);
    const demoUser = await User.create({
      email: "analyst@demo-insurance.com",
      passwordHash,
      name: "Maya Chen (Lead Fraud Analyst)",
      role: "analyst",
    });
    console.log(`Created user: ${demoUser.email} (password: demo123)`);

    // 2. Seed 5 Providers
    console.log("Seeding Providers...");
    const providers = await Provider.insertMany([
      {
        providerId: "PROV-001",
        name: "Metro General Hospital",
        type: "hospital",
        averageClaimAmount: 320000,
        claimCount: 42,
      },
      {
        providerId: "PROV-002",
        name: "Apex Orthopedic Surgery Clinic",
        type: "clinic",
        averageClaimAmount: 210000,
        claimCount: 18,
      },
      {
        providerId: "PROV-003",
        name: "FastFix Auto Collision Repair",
        type: "repair_shop",
        averageClaimAmount: 480000, // Significant billing outlier
        claimCount: 26,
      },
      {
        providerId: "PROV-004",
        name: "Reliable Home Restoration Partners",
        type: "contractor",
        averageClaimAmount: 180000,
        claimCount: 31,
      },
      {
        providerId: "PROV-005",
        name: "ClearView Diagnostic Imaging Center",
        type: "clinic",
        averageClaimAmount: 95000,
        claimCount: 50,
      },
    ]);

    // 3. Seed 25 Claims with Embedded Scenarios
    console.log("Seeding Claims...");
    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const claimsData = [
      // SCENARIO 1: High-Risk Coordinated Fraud Ring (Shared Entity + Recent Policy + High Amount)
      {
        claimId: "CLM-003",
        customerId: "CUST-003",
        customerName: "Vikram Malhotra",
        policyId: "POL-AUTO-881",
        policyStartDate: daysAgo(22), // Recent policy (<90 days)
        policyType: "auto",
        policyCoverage: 500000,
        claimDate: daysAgo(4),
        claimAmount: 460000, // 92% of coverage, >2x provider avg
        incidentType: "total_loss_collision",
        description: "Multi-vehicle nighttime highway collision resulting in complete frame deformation.",
        providerId: "PROV-003", // FastFix Auto Collision Repair
        providerName: "FastFix Auto Collision Repair",
        paymentAccountId: "ACCT-7890", // Shared payment account
        status: "under_review",
      },
      {
        claimId: "CLM-020",
        customerId: "CUST-014",
        customerName: "Sunita Verma",
        policyId: "POL-AUTO-942",
        policyStartDate: daysAgo(45), // Recent policy
        policyType: "auto",
        policyCoverage: 600000,
        claimDate: daysAgo(12),
        claimAmount: 490000,
        incidentType: "front_end_collision",
        description: "Severe front axle and radiator damage following stationary barrier impact.",
        providerId: "PROV-003", // Same suspicious provider
        providerName: "FastFix Auto Collision Repair",
        paymentAccountId: "ACCT-7890", // Shared payment account
        status: "under_review",
      },

      // SCENARIO 2: Repeated Claims Pattern (Claimant velocity anomaly)
      {
        claimId: "CLM-010",
        customerId: "CUST-007",
        customerName: "Rohit Mehta",
        policyId: "POL-PROP-304",
        policyStartDate: daysAgo(400),
        policyType: "property",
        policyCoverage: 1000000,
        claimDate: daysAgo(240),
        claimAmount: 110000,
        incidentType: "water_pipe_leak",
        description: "Basement carpet and drywall damage from burst bathroom pipe.",
        providerId: "PROV-004",
        providerName: "Reliable Home Restoration Partners",
        paymentAccountId: "ACCT-3007",
        status: "approved",
      },
      {
        claimId: "CLM-011",
        customerId: "CUST-007",
        customerName: "Rohit Mehta",
        policyId: "POL-PROP-304",
        policyStartDate: daysAgo(400),
        policyType: "property",
        policyCoverage: 1000000,
        claimDate: daysAgo(150),
        claimAmount: 95000,
        incidentType: "theft_burglary",
        description: "Electronics and tools stolen from locked backyard storage unit.",
        providerId: "PROV-004",
        providerName: "Reliable Home Restoration Partners",
        paymentAccountId: "ACCT-3007",
        status: "approved",
      },
      {
        claimId: "CLM-012",
        customerId: "CUST-007",
        customerName: "Rohit Mehta",
        policyId: "POL-PROP-304",
        policyStartDate: daysAgo(400),
        policyType: "property",
        policyCoverage: 1000000,
        claimDate: daysAgo(60),
        claimAmount: 180000,
        incidentType: "storm_roof_damage",
        description: "Roof tile displacement and ceiling leakage after hailstorm.",
        providerId: "PROV-004",
        providerName: "Reliable Home Restoration Partners",
        paymentAccountId: "ACCT-3007",
        status: "approved",
      },
      {
        claimId: "CLM-013",
        customerId: "CUST-007",
        customerName: "Rohit Mehta",
        policyId: "POL-PROP-304",
        policyStartDate: daysAgo(400),
        policyType: "property",
        policyCoverage: 1000000,
        claimDate: daysAgo(8), // 4th claim within 12 months!
        claimAmount: 220000,
        incidentType: "appliance_fire",
        description: "Kitchen wiring electrical fire causing cabinetry smoke and heat damage.",
        providerId: "PROV-004",
        providerName: "Reliable Home Restoration Partners",
        paymentAccountId: "ACCT-3007",
        status: "open",
      },

      // SCENARIO 3: Legitimate High-Value Claim (Controls against false positives: High Amount alone != Fraud)
      {
        claimId: "CLM-005",
        customerId: "CUST-005",
        customerName: "Ananya Sharma",
        policyId: "POL-PROP-109",
        policyStartDate: daysAgo(1200), // Established 3+ year policy
        policyType: "property",
        policyCoverage: 2000000,
        claimDate: daysAgo(15),
        claimAmount: 850000, // Large amount, but low ratio, established history
        incidentType: "structural_fire",
        description: "Substantial ground floor fire damage fully documented with official fire marshal report.",
        providerId: "PROV-004",
        providerName: "Reliable Home Restoration Partners",
        paymentAccountId: "ACCT-5001",
        status: "under_review",
      },

      // SCENARIO 4: Suspicious Provider Outlier
      {
        claimId: "CLM-015",
        customerId: "CUST-011",
        customerName: "Kavita Reddy",
        policyId: "POL-AUTO-519",
        policyStartDate: daysAgo(300),
        policyType: "auto",
        policyCoverage: 800000,
        claimDate: daysAgo(20),
        claimAmount: 490000, // Outlier provider PROV-003
        incidentType: "rear_end_collision",
        description: "Rear panel and exhaust replacement.",
        providerId: "PROV-003",
        providerName: "FastFix Auto Collision Repair",
        paymentAccountId: "ACCT-9112",
        status: "open",
      },

      // SCENARIO 5: Clean Baseline Claims (Normal patterns)
      {
        claimId: "CLM-001",
        customerId: "CUST-001",
        customerName: "Aarav Patel",
        policyId: "POL-HLTH-101",
        policyStartDate: daysAgo(720),
        policyType: "health",
        policyCoverage: 500000,
        claimDate: daysAgo(30),
        claimAmount: 85000,
        incidentType: "appendectomy",
        description: "Emergency acute appendectomy and 2-night inpatient observation.",
        providerId: "PROV-001",
        providerName: "Metro General Hospital",
        paymentAccountId: "ACCT-1001",
        status: "approved",
      },
      {
        claimId: "CLM-002",
        customerId: "CUST-002",
        customerName: "Priya Nair",
        policyId: "POL-HLTH-102",
        policyStartDate: daysAgo(540),
        policyType: "health",
        policyCoverage: 400000,
        claimDate: daysAgo(18),
        claimAmount: 62000,
        incidentType: "knee_arthroscopy",
        description: "Outpatient meniscus repair with routine physical therapy prescription.",
        providerId: "PROV-002",
        providerName: "Apex Orthopedic Surgery Clinic",
        paymentAccountId: "ACCT-1002",
        status: "approved",
      },
      {
        claimId: "CLM-004",
        customerId: "CUST-004",
        customerName: "Deepak Joshi",
        policyId: "POL-AUTO-204",
        policyStartDate: daysAgo(850),
        policyType: "auto",
        policyCoverage: 450000,
        claimDate: daysAgo(25),
        claimAmount: 42000,
        incidentType: "windshield_crack",
        description: "Stone chip fracture requiring windshield replacement.",
        providerId: "PROV-003",
        providerName: "FastFix Auto Collision Repair",
        paymentAccountId: "ACCT-1004",
        status: "approved",
      },
      {
        claimId: "CLM-006",
        customerId: "CUST-006",
        customerName: "Sneha Sen",
        policyId: "POL-HLTH-301",
        policyStartDate: daysAgo(600),
        policyType: "health",
        policyCoverage: 300000,
        claimDate: daysAgo(40),
        claimAmount: 38000,
        incidentType: "mri_brain_scan",
        description: "Diagnostic MRI series for recurring migrainous symptoms.",
        providerId: "PROV-005",
        providerName: "ClearView Diagnostic Imaging Center",
        paymentAccountId: "ACCT-1006",
        status: "approved",
      },
      {
        claimId: "CLM-007",
        customerId: "CUST-008",
        customerName: "Amitabh Roy",
        policyId: "POL-PROP-402",
        policyStartDate: daysAgo(900),
        policyType: "property",
        policyCoverage: 1500000,
        claimDate: daysAgo(50),
        claimAmount: 75000,
        incidentType: "fence_collapse",
        description: "Boundary wooden fence downed during heavy monsoon winds.",
        providerId: "PROV-004",
        providerName: "Reliable Home Restoration Partners",
        paymentAccountId: "ACCT-1008",
        status: "approved",
      },
      {
        claimId: "CLM-008",
        customerId: "CUST-009",
        customerName: "Neha Kapoor",
        policyId: "POL-AUTO-501",
        policyStartDate: daysAgo(350),
        policyType: "auto",
        policyCoverage: 600000,
        claimDate: daysAgo(14),
        claimAmount: 110000,
        incidentType: "side_mirror_scrape",
        description: "Scratched driver-side panels and broken mirror housing from parking lot scrape.",
        providerId: "PROV-003",
        providerName: "FastFix Auto Collision Repair",
        paymentAccountId: "ACCT-1009",
        status: "under_review",
      },
      {
        claimId: "CLM-009",
        customerId: "CUST-010",
        customerName: "Manoj Deshmukh",
        policyId: "POL-HLTH-602",
        policyStartDate: daysAgo(420),
        policyType: "health",
        policyCoverage: 700000,
        claimDate: daysAgo(11),
        claimAmount: 135000,
        incidentType: "kidney_stone_lithotripsy",
        description: "Shock wave lithotripsy procedure and follow-up sonography.",
        providerId: "PROV-001",
        providerName: "Metro General Hospital",
        paymentAccountId: "ACCT-1010",
        status: "open",
      },
      {
        claimId: "CLM-014",
        customerId: "CUST-012",
        customerName: "Ritu Singhania",
        policyId: "POL-HLTH-703",
        policyStartDate: daysAgo(610),
        policyType: "health",
        policyCoverage: 500000,
        claimDate: daysAgo(29),
        claimAmount: 52000,
        incidentType: "lumbar_spine_scan",
        description: "High-resolution lumbar spine CT scan following mild strain.",
        providerId: "PROV-005",
        providerName: "ClearView Diagnostic Imaging Center",
        paymentAccountId: "ACCT-1012",
        status: "approved",
      },
      {
        claimId: "CLM-016",
        customerId: "CUST-013",
        customerName: "Sanjay Iyer",
        policyId: "POL-PROP-801",
        policyStartDate: daysAgo(1100),
        policyType: "property",
        policyCoverage: 1200000,
        claimDate: daysAgo(75),
        claimAmount: 64000,
        incidentType: "window_breakage",
        description: "Shattered double-glazed patio door during high-pressure hail squall.",
        providerId: "PROV-004",
        providerName: "Reliable Home Restoration Partners",
        paymentAccountId: "ACCT-1013",
        status: "approved",
      },
      {
        claimId: "CLM-017",
        customerId: "CUST-015",
        customerName: "Tara Mukherjee",
        policyId: "POL-AUTO-901",
        policyStartDate: daysAgo(480),
        policyType: "auto",
        policyCoverage: 350000,
        claimDate: daysAgo(33),
        claimAmount: 48000,
        incidentType: "bumper_dent",
        description: "Rear plastic bumper dent repair and color matching.",
        providerId: "PROV-003",
        providerName: "FastFix Auto Collision Repair",
        paymentAccountId: "ACCT-1015",
        status: "approved",
      },
      {
        claimId: "CLM-018",
        customerId: "CUST-001",
        customerName: "Aarav Patel",
        policyId: "POL-HLTH-101",
        policyStartDate: daysAgo(720),
        policyType: "health",
        policyCoverage: 500000,
        claimDate: daysAgo(190),
        claimAmount: 24000,
        incidentType: "dermatology_biopsy",
        description: "Minor skin lesion excision and benign histopathology lab test.",
        providerId: "PROV-001",
        providerName: "Metro General Hospital",
        paymentAccountId: "ACCT-1001",
        status: "approved",
      },
      {
        claimId: "CLM-019",
        customerId: "CUST-002",
        customerName: "Priya Nair",
        policyId: "POL-HLTH-102",
        policyStartDate: daysAgo(540),
        policyType: "health",
        policyCoverage: 400000,
        claimDate: daysAgo(310),
        claimAmount: 18000,
        incidentType: "ankle_sprain_xray",
        description: "Bilateral weight-bearing foot and ankle radiographic series.",
        providerId: "PROV-005",
        providerName: "ClearView Diagnostic Imaging Center",
        paymentAccountId: "ACCT-1002",
        status: "approved",
      },
      {
        claimId: "CLM-021",
        customerId: "CUST-011",
        customerName: "Kavita Reddy",
        policyId: "POL-AUTO-519",
        policyStartDate: daysAgo(300),
        policyType: "auto",
        policyCoverage: 800000,
        claimDate: daysAgo(140),
        claimAmount: 32000,
        incidentType: "paint_scratch",
        description: "Key scratch detailing along passenger doors.",
        providerId: "PROV-003",
        providerName: "FastFix Auto Collision Repair",
        paymentAccountId: "ACCT-9112",
        status: "approved",
      },
      {
        claimId: "CLM-022",
        customerId: "CUST-005",
        customerName: "Ananya Sharma",
        policyId: "POL-PROP-109",
        policyStartDate: daysAgo(1200),
        policyType: "property",
        policyCoverage: 2000000,
        claimDate: daysAgo(500),
        claimAmount: 45000,
        incidentType: "garden_shed_flood",
        description: "Sump pump failure flooding garden tool storage.",
        providerId: "PROV-004",
        providerName: "Reliable Home Restoration Partners",
        paymentAccountId: "ACCT-5001",
        status: "approved",
      },
      {
        claimId: "CLM-023",
        customerId: "CUST-004",
        customerName: "Deepak Joshi",
        policyId: "POL-AUTO-204",
        policyStartDate: daysAgo(850),
        policyType: "auto",
        policyCoverage: 450000,
        claimDate: daysAgo(420),
        claimAmount: 29000,
        incidentType: "headlight_assembly",
        description: "Cracked passenger xenon headlamp lens replacement.",
        providerId: "PROV-003",
        providerName: "FastFix Auto Collision Repair",
        paymentAccountId: "ACCT-1004",
        status: "approved",
      },
      {
        claimId: "CLM-024",
        customerId: "CUST-006",
        customerName: "Sneha Sen",
        policyId: "POL-HLTH-301",
        policyStartDate: daysAgo(600),
        policyType: "health",
        policyCoverage: 300000,
        claimDate: daysAgo(210),
        claimAmount: 19500,
        incidentType: "ultrasound_abdomen",
        description: "Routine abdominal ultrasound screening.",
        providerId: "PROV-005",
        providerName: "ClearView Diagnostic Imaging Center",
        paymentAccountId: "ACCT-1006",
        status: "approved",
      },
      {
        claimId: "CLM-025",
        customerId: "CUST-010",
        customerName: "Manoj Deshmukh",
        policyId: "POL-HLTH-602",
        policyStartDate: daysAgo(420),
        policyType: "health",
        policyCoverage: 700000,
        claimDate: daysAgo(160),
        claimAmount: 44000,
        incidentType: "wrist_fracture_cast",
        description: "Colles fracture closed reduction and waterproof fiberglass cast application.",
        providerId: "PROV-002",
        providerName: "Apex Orthopedic Surgery Clinic",
        paymentAccountId: "ACCT-1010",
        status: "approved",
      },
    ];

    const insertedClaims = await Claim.insertMany(claimsData);
    console.log(`Inserted ${insertedClaims.length} claims.`);

    // 4. Seed Pre-existing Investigations
    console.log("Seeding Investigations...");
    await Investigation.insertMany([
      {
        claimId: "CLM-020",
        status: "under_investigation",
        notes: [
          {
            text: "Initial triage flagged shared bank account ACCT-7890 with claim CLM-003.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(3),
          },
          {
            text: "Requested garage invoice breakdown and tow truck dispatch log from FastFix Auto.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(1),
          },
        ],
        outcome: "",
        updatedAt: daysAgo(1),
      },
      {
        claimId: "CLM-008",
        status: "cleared",
        notes: [
          {
            text: "Minor scratch on side mirror investigated due to provider billing history.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(10),
          },
          {
            text: "Verified parking garage CCTV timestamp matches incident filing exactly.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(6),
          },
        ],
        outcome: "Verified legitimate incidental damage via third-party parking surveillance footage.",
        updatedAt: daysAgo(6),
      },
    ]);

    console.log("Database seeded successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedData();
