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

    // 2. Seed 7 Realistic Providers across specialties
    console.log("Seeding Providers...");
    await Provider.insertMany([
      {
        providerId: "PROV-001",
        name: "Metro General Multi-Specialty Hospital",
        type: "hospital",
        averageClaimAmount: 310000,
        claimCount: 48,
      },
      {
        providerId: "PROV-002",
        name: "Apex Orthopedic & Joint Center",
        type: "clinic",
        averageClaimAmount: 195000,
        claimCount: 24,
      },
      {
        providerId: "PROV-003",
        name: "FastFix Auto Collision Repair",
        type: "repair_shop",
        averageClaimAmount: 485000, // Significant Billing Outlier (~2.5x system baseline)
        claimCount: 29,
      },
      {
        providerId: "PROV-004",
        name: "Reliable Home & Restoration Contractors",
        type: "contractor",
        averageClaimAmount: 175000,
        claimCount: 35,
      },
      {
        providerId: "PROV-005",
        name: "ClearView Diagnostic & Imaging Institute",
        type: "clinic",
        averageClaimAmount: 85000,
        claimCount: 52,
      },
      {
        providerId: "PROV-006",
        name: "Sunrise Wellness & Physical Rehabilitation",
        type: "clinic",
        averageClaimAmount: 360000, // Secondary Billing Outlier
        claimCount: 19,
      },
      {
        providerId: "PROV-007",
        name: "National Precision Fleet Workshop",
        type: "repair_shop",
        averageClaimAmount: 135000,
        claimCount: 41,
      },
    ]);

    // 3. Seed 35 Realistic Claims with Clear Scenarios
    console.log("Seeding 35 realistic claims...");
    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const claimsData = [
      // =========================================================================
      // CLUSTER 1: Coordinated Crash-for-Cash Ring (High Risk: 85)
      // Linked via shared payout account ACCT-7890 and repair garage PROV-003
      // =========================================================================
      {
        claimId: "CLM-003",
        customerId: "CUST-003",
        customerName: "Vikram Malhotra",
        policyId: "POL-AUTO-881",
        policyStartDate: daysAgo(22), // Recent policy
        policyType: "auto",
        policyCoverage: 500000,
        claimDate: daysAgo(4),
        claimAmount: 460000, // 92% coverage ratio
        incidentType: "total_loss_collision",
        description: "Late-night multi-vehicle collision resulting in total frame deformation and airbag deployment.",
        providerId: "PROV-003",
        providerName: "FastFix Auto Collision Repair",
        paymentAccountId: "ACCT-7890", // Shared Account
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
        claimAmount: 490000, // 81% coverage ratio
        incidentType: "front_end_collision",
        description: "Severe front axle, radiator, and engine block impact into stationary highway barrier.",
        providerId: "PROV-003",
        providerName: "FastFix Auto Collision Repair",
        paymentAccountId: "ACCT-7890", // Shared Account
        status: "under_review",
      },
      {
        claimId: "CLM-028",
        customerId: "CUST-021",
        customerName: "Arjun Kapoor",
        policyId: "POL-AUTO-988",
        policyStartDate: daysAgo(35), // Recent policy
        policyType: "auto",
        policyCoverage: 550000,
        claimDate: daysAgo(7),
        claimAmount: 480000, // 87% coverage ratio
        incidentType: "t_bone_impact",
        description: "Intersection passenger door intrusion and structural B-pillar displacement.",
        providerId: "PROV-003",
        providerName: "FastFix Auto Collision Repair",
        paymentAccountId: "ACCT-7890", // Shared Account
        status: "open",
      },

      // =========================================================================
      // CLUSTER 2: Phantom Clinic Soft-Tissue Ring (High Risk: 70 - 75)
      // Linked via shared payout account ACCT-4421 and clinic PROV-006
      // =========================================================================
      {
        claimId: "CLM-031",
        customerId: "CUST-023",
        customerName: "Pooja Bhatt",
        policyId: "POL-HLTH-812",
        policyStartDate: daysAgo(50), // Recent policy
        policyType: "health",
        policyCoverage: 450000,
        claimDate: daysAgo(9),
        claimAmount: 385000, // 85% coverage
        incidentType: "neuromuscular_rehab",
        description: "Extended inpatient neurological decompression and soft tissue rehabilitation course.",
        providerId: "PROV-006",
        providerName: "Sunrise Wellness & Physical Rehabilitation",
        paymentAccountId: "ACCT-4421", // Shared Account
        status: "open",
      },
      {
        claimId: "CLM-032",
        customerId: "CUST-024",
        customerName: "Rohan Sharma",
        policyId: "POL-HLTH-819",
        policyStartDate: daysAgo(65), // Recent policy
        policyType: "health",
        policyCoverage: 400000,
        claimDate: daysAgo(14),
        claimAmount: 340000, // 85% coverage
        incidentType: "spinal_decompression",
        description: "Comprehensive cervical spine physical therapy series with electro-stimulation therapy.",
        providerId: "PROV-006",
        providerName: "Sunrise Wellness & Physical Rehabilitation",
        paymentAccountId: "ACCT-4421", // Shared Account
        status: "open",
      },

      // =========================================================================
      // CLUSTER 3: High Claimant Velocity (Medium Risk: 40 - 55)
      // Rohit Mehta (CUST-007) filing 4 claims in 12 months
      // =========================================================================
      {
        claimId: "CLM-010",
        customerId: "CUST-007",
        customerName: "Rohit Mehta",
        policyId: "POL-PROP-304",
        policyStartDate: daysAgo(410),
        policyType: "property",
        policyCoverage: 1000000,
        claimDate: daysAgo(250),
        claimAmount: 110000,
        incidentType: "water_pipe_leak",
        description: "Basement carpet and subfloor saturation from cracked internal riser pipe.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors",
        paymentAccountId: "ACCT-3007",
        status: "approved",
      },
      {
        claimId: "CLM-011",
        customerId: "CUST-007",
        customerName: "Rohit Mehta",
        policyId: "POL-PROP-304",
        policyStartDate: daysAgo(410),
        policyType: "property",
        policyCoverage: 1000000,
        claimDate: daysAgo(160),
        claimAmount: 95000,
        incidentType: "theft_burglary",
        description: "Forced entry into detached tool shed; power tools and garden equipment stolen.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors",
        paymentAccountId: "ACCT-3007",
        status: "approved",
      },
      {
        claimId: "CLM-012",
        customerId: "CUST-007",
        customerName: "Rohit Mehta",
        policyId: "POL-PROP-304",
        policyStartDate: daysAgo(410),
        policyType: "property",
        policyCoverage: 1000000,
        claimDate: daysAgo(70),
        claimAmount: 180000,
        incidentType: "storm_roof_damage",
        description: "Clay roof tile displacement and attic water seepage following severe hail.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors",
        paymentAccountId: "ACCT-3007",
        status: "approved",
      },
      {
        claimId: "CLM-013",
        customerId: "CUST-007",
        customerName: "Rohit Mehta",
        policyId: "POL-PROP-304",
        policyStartDate: daysAgo(410),
        policyType: "property",
        policyCoverage: 1000000,
        claimDate: daysAgo(8), // 4th claim!
        claimAmount: 240000,
        incidentType: "appliance_fire",
        description: "Kitchen range hood electrical surge causing wall cabinetry scorching and smoke damage.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors",
        paymentAccountId: "ACCT-3007",
        status: "open",
      },

      // =========================================================================
      // CLUSTER 4: High Ratio & Recent Inception Inquiries (Medium Risk: 40 - 55)
      // =========================================================================
      {
        claimId: "CLM-015",
        customerId: "CUST-011",
        customerName: "Kavita Reddy",
        policyId: "POL-AUTO-519",
        policyStartDate: daysAgo(300),
        policyType: "auto",
        policyCoverage: 600000,
        claimDate: daysAgo(20),
        claimAmount: 490000, // 81% of coverage at outlier garage
        incidentType: "rear_end_collision",
        description: "Trunk floor crumpling and dual rear quarter panel replacement.",
        providerId: "PROV-003",
        providerName: "FastFix Auto Collision Repair",
        paymentAccountId: "ACCT-9112",
        status: "open",
      },
      {
        claimId: "CLM-033",
        customerId: "CUST-025",
        customerName: "Harish Varma",
        policyId: "POL-PROP-991",
        policyStartDate: daysAgo(38), // Recent policy
        policyType: "property",
        policyCoverage: 600000,
        claimDate: daysAgo(11),
        claimAmount: 450000, // 75% coverage
        incidentType: "boundary_wall_collapse",
        description: "Brick compound perimeter wall collapsed after torrential rains.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors",
        paymentAccountId: "ACCT-6511",
        status: "under_review",
      },
      {
        claimId: "CLM-034",
        customerId: "CUST-026",
        customerName: "Devika Nair",
        policyId: "POL-AUTO-772",
        policyStartDate: daysAgo(42), // Recent policy
        policyType: "auto",
        policyCoverage: 500000,
        claimDate: daysAgo(15),
        claimAmount: 380000, // 76% coverage
        incidentType: "engine_bay_fire",
        description: "Under-hood alternator harness short circuit leading to wiring fire.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet Workshop",
        paymentAccountId: "ACCT-8822",
        status: "open",
      },

      // =========================================================================
      // CLUSTER 5: Legitimate High-Value Claims (Low Risk: 0 - 20)
      // Controls against false positives: High Amount != Fraud
      // =========================================================================
      {
        claimId: "CLM-005",
        customerId: "CUST-005",
        customerName: "Ananya Sharma",
        policyId: "POL-PROP-109",
        policyStartDate: daysAgo(1250), // 3.5 year established policy
        policyType: "property",
        policyCoverage: 2500000,
        claimDate: daysAgo(16),
        claimAmount: 850000, // Large amount, but only 34% of coverage!
        incidentType: "structural_fire",
        description: "Ground-floor living area structural fire verified by municipal fire brigade department report.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors",
        paymentAccountId: "ACCT-5001",
        status: "under_review",
      },
      {
        claimId: "CLM-030",
        customerId: "CUST-022",
        customerName: "Dr. Arvind Nambiar",
        policyId: "POL-HLTH-001",
        policyStartDate: daysAgo(2100), // 5+ year policy
        policyType: "health",
        policyCoverage: 3000000,
        claimDate: daysAgo(28),
        claimAmount: 1150000, // Substantial medical procedure, but 38% coverage
        incidentType: "coronary_artery_bypass",
        description: "Emergency quadruple coronary artery bypass grafting with 6-day ICU recovery monitoring.",
        providerId: "PROV-001",
        providerName: "Metro General Multi-Specialty Hospital",
        paymentAccountId: "ACCT-9901",
        status: "approved",
      },

      // =========================================================================
      // CLUSTER 6: Clean Baseline Claims (Low Risk: 0 - 25)
      // Normal patterns across health, property, and auto
      // =========================================================================
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
        incidentType: "laparoscopic_appendectomy",
        description: "Uncomplicated laparoscopic appendectomy with 24-hour observation stay.",
        providerId: "PROV-001",
        providerName: "Metro General Multi-Specialty Hospital",
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
        description: "Right knee medial meniscus partial resection and post-op physical rehabilitation.",
        providerId: "PROV-002",
        providerName: "Apex Orthopedic & Joint Center",
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
        incidentType: "windshield_stone_chip",
        description: "Highway debris impact causing acoustic laminated front windshield fracture.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet Workshop",
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
        incidentType: "cranial_mri_series",
        description: "3T high-resolution magnetic resonance cranial angiography series for recurrent syncope.",
        providerId: "PROV-005",
        providerName: "ClearView Diagnostic & Imaging Institute",
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
        incidentType: "pergola_wind_shear",
        description: "Heavy monsoon winds sheared outdoor timber pergola and patio tiling.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors",
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
        incidentType: "driver_mirror_scrape",
        description: "Narrow underground garage concrete pillar contact damaging mirror housing and door sensor.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet Workshop",
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
        incidentType: "ureteric_lithotripsy",
        description: "Extracorporeal shock wave lithotripsy procedure with ureteral stent placement.",
        providerId: "PROV-001",
        providerName: "Metro General Multi-Specialty Hospital",
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
        incidentType: "lumbar_disc_mri",
        description: "Multi-plane lumbar spine MRI scan confirming L4-L5 disc protrusion.",
        providerId: "PROV-005",
        providerName: "ClearView Diagnostic & Imaging Institute",
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
        incidentType: "tempered_glass_fracture",
        description: "Thermal stress fracture on double-paned rear sliding glass patio door.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors",
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
        incidentType: "rear_bumper_fascia",
        description: "Parallel parking impact requiring plastic bumper cover respray and sensor recalibration.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet Workshop",
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
        incidentType: "dermatological_excision",
        description: "Benign epidermal cyst surgical removal and histopathological lab analysis.",
        providerId: "PROV-001",
        providerName: "Metro General Multi-Specialty Hospital",
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
        incidentType: "talonavicular_xray",
        description: "Bilateral standing stress radiographs for chronic ankle instability.",
        providerId: "PROV-005",
        providerName: "ClearView Diagnostic & Imaging Institute",
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
        incidentType: "vandalism_key_scratch",
        description: "Surface paint scratch repair across driver side door panels.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet Workshop",
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
        incidentType: "submersible_pump_burnout",
        description: "Sump pump electrical failure during storm, causing localized basement dampness.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors",
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
        incidentType: "headlamp_lens_replacement",
        description: "Cracked passenger xenon headlamp assembly replacement.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet Workshop",
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
        incidentType: "abdominal_doppler_scan",
        description: "High-resolution color Doppler ultrasonography for portal venous flow evaluation.",
        providerId: "PROV-005",
        providerName: "ClearView Diagnostic & Imaging Institute",
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
        incidentType: "colles_fracture_splint",
        description: "Closed distal radius fracture reduction and waterproof fiberglass immobilization cast.",
        providerId: "PROV-002",
        providerName: "Apex Orthopedic & Joint Center",
        paymentAccountId: "ACCT-1010",
        status: "approved",
      },
      {
        claimId: "CLM-026",
        customerId: "CUST-016",
        customerName: "Gaurav Singhal",
        policyId: "POL-AUTO-611",
        policyStartDate: daysAgo(680),
        policyType: "auto",
        policyCoverage: 400000,
        claimDate: daysAgo(45),
        claimAmount: 38000,
        incidentType: "side_curtain_sensor_fix",
        description: "Replaced faulty lateral accelerometer sensor triggering false SRS warning light.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet Workshop",
        paymentAccountId: "ACCT-1016",
        status: "approved",
      },
      {
        claimId: "CLM-027",
        customerId: "CUST-017",
        customerName: "Meenakshi Pillai",
        policyId: "POL-PROP-720",
        policyStartDate: daysAgo(520),
        policyType: "property",
        policyCoverage: 800000,
        claimDate: daysAgo(62),
        claimAmount: 51000,
        incidentType: "terrace_waterproofing",
        description: "Elastomeric roof sealing after post-monsoon hairline terrace slab cracking.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors",
        paymentAccountId: "ACCT-1017",
        status: "approved",
      },
      {
        claimId: "CLM-029",
        customerId: "CUST-018",
        customerName: "Naveen Chawla",
        policyId: "POL-HLTH-445",
        policyStartDate: daysAgo(380),
        policyType: "health",
        policyCoverage: 500000,
        claimDate: daysAgo(55),
        claimAmount: 68000,
        incidentType: "cataract_phacoemulsification",
        description: "Unilateral phacoemulsification with foldable intraocular lens implantation.",
        providerId: "PROV-001",
        providerName: "Metro General Multi-Specialty Hospital",
        paymentAccountId: "ACCT-1018",
        status: "approved",
      },
      {
        claimId: "CLM-035",
        customerId: "CUST-020",
        customerName: "Bhavna Bhattacharya",
        policyId: "POL-AUTO-331",
        policyStartDate: daysAgo(450),
        policyType: "auto",
        policyCoverage: 350000,
        claimDate: daysAgo(38),
        claimAmount: 26000,
        incidentType: "tail_light_assembly",
        description: "Broken passenger LED rear tail lamp assembly replacement after reversing incident.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet Workshop",
        paymentAccountId: "ACCT-1020",
        status: "approved",
      },
    ];

    const insertedClaims = await Claim.insertMany(claimsData);
    console.log(`Inserted ${insertedClaims.length} realistic claims.`);

    // 4. Seed Pre-existing Investigations with Rich Real-World Forensic Case Notes
    console.log("Seeding Investigations...");
    await Investigation.insertMany([
      {
        claimId: "CLM-020",
        status: "under_investigation",
        notes: [
          {
            text: "Initial screening flagged shared bank account ACCT-7890 connection with claim CLM-003 (Vikram Malhotra).",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(3),
          },
          {
            text: "Contacted regional towing dispatch. Found no record of flatbed dispatch to specified highway mile marker on incident date.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(2),
          },
          {
            text: "Dispatched field special investigator to inspect FastFix Auto repair facility. Garage manager refused access to damaged vehicle parts.",
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
            text: "Minor scratch on side mirror flagged for review due to elevated provider billing multiplier.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(10),
          },
          {
            text: "Customer provided timestamped dashcam video and underground mall security log confirming pillar impact.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(6),
          },
        ],
        outcome: "Verified legitimate single-vehicle incident via third-party mall parking CCTV and synchronized dashcam footage.",
        updatedAt: daysAgo(6),
      },
      {
        claimId: "CLM-013",
        status: "under_investigation",
        notes: [
          {
            text: "Automated alert: Customer Rohit Mehta has filed 4 distinct property loss claims within 12 months.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(5),
          },
          {
            text: "Subpoenaed electrical repair technician records. Range hood fire appears caused by unapproved DIY wiring modification.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(2),
          },
        ],
        outcome: "",
        updatedAt: daysAgo(2),
      },
    ]);

    console.log("Database seeded successfully with rich, realistic data!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedData();
