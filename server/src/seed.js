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

    // 2. Seed 10 Realistic Providers across Specialties (Hospitals, Clinics, Garages, Contractors)
    console.log("Seeding Providers...");
    await Provider.insertMany([
      {
        providerId: "PROV-001",
        name: "Metro General Super-Specialty Hospital (Kandivali West)",
        type: "hospital",
        averageClaimAmount: 285000,
        claimCount: 64,
      },
      {
        providerId: "PROV-002",
        name: "Apex Orthopedic & Joint Reconstruction Institute (Vile Parle)",
        type: "clinic",
        averageClaimAmount: 195000,
        claimCount: 38,
      },
      {
        providerId: "PROV-003",
        name: "FastFix Multi-Brand Collision Repair Works (Goregaon West)",
        type: "repair_shop",
        averageClaimAmount: 485000, // Significant Outlier (2.4x system baseline)
        claimCount: 29,
      },
      {
        providerId: "PROV-004",
        name: "Reliable Home & Restoration Contractors (Navi Mumbai)",
        type: "contractor",
        averageClaimAmount: 175000,
        claimCount: 42,
      },
      {
        providerId: "PROV-005",
        name: "ClearView Diagnostic Imaging & MRI Institute (Dadar)",
        type: "clinic",
        averageClaimAmount: 35000,
        claimCount: 78,
      },
      {
        providerId: "PROV-006",
        name: "Sunrise Wellness & Spine Rehabilitation Centre (Chembur)",
        type: "clinic",
        averageClaimAmount: 390000, // Significant Outlier (1.9x system baseline, 4.5x clinic benchmark)
        claimCount: 21,
      },
      {
        providerId: "PROV-007",
        name: "National Precision Fleet & Auto Services (Andheri East)",
        type: "repair_shop",
        averageClaimAmount: 135000,
        claimCount: 56,
      },
      {
        providerId: "PROV-008",
        name: "Lifecare Daycare & Laparoscopic Surgery Centre (Borivali)",
        type: "clinic",
        averageClaimAmount: 68000,
        claimCount: 45,
      },
      {
        providerId: "PROV-009",
        name: "Star City Authorized Automotive Workshop (Thane West)",
        type: "repair_shop",
        averageClaimAmount: 118000,
        claimCount: 39,
      },
      {
        providerId: "PROV-010",
        name: "Apex Structural Builders & Waterproofing Works (Vashi)",
        type: "contractor",
        averageClaimAmount: 155000,
        claimCount: 33,
      },
    ]);

    // 3. Seed Realistic Claims
    console.log("Seeding realistic claims...");
    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const claimsData = [
      // =========================================================================
      // CLUSTER 1: Coordinated Crash-for-Cash Auto Ring (High Risk: Score 85)
      // Linked via shared payout account HDFC-5010049281729 and outlier garage PROV-003
      // =========================================================================
      {
        claimId: "CLM-003",
        customerId: "CUST-003",
        customerName: "Vikram Malhotra",
        policyId: "POL-MOT-COMP-88192",
        policyStartDate: daysAgo(22), // Recent policy
        policyType: "auto",
        policyCoverage: 500000,
        claimDate: daysAgo(4),
        claimAmount: 460000, // 92% coverage ratio
        incidentType: "total_loss_collision",
        description: "2024 Mahindra XUV700 AX7 (MH-02-FE-8812) - Alleged multi-vehicle rollover on Western Express Highway near Goregaon flyover at 02:40 AM. Unempanelled garage FastFix submitted total-loss estimate.",
        providerId: "PROV-003",
        providerName: "FastFix Multi-Brand Collision Repair Works (Goregaon West)",
        paymentAccountId: "HDFC-5010049281729", // Shared Account
        status: "under_review",
      },
      {
        claimId: "CLM-020",
        customerId: "CUST-014",
        customerName: "Sunita Verma",
        policyId: "POL-MOT-COMP-94210",
        policyStartDate: daysAgo(45), // Recent policy
        policyType: "auto",
        policyCoverage: 600000,
        claimDate: daysAgo(12),
        claimAmount: 490000, // 81% coverage ratio
        incidentType: "front_end_collision",
        description: "2023 Hyundai Creta 1.5 SX(O) (MH-01-EE-4190) - Heavy front-end impact into stationary highway divider on Jogeshwari Link Road. Airbag modules deployed with pre-existing salvage part markings.",
        providerId: "PROV-003",
        providerName: "FastFix Multi-Brand Collision Repair Works (Goregaon West)",
        paymentAccountId: "HDFC-5010049281729", // Shared Account
        status: "under_review",
      },
      {
        claimId: "CLM-028",
        customerId: "CUST-021",
        customerName: "Arjun Kapoor",
        policyId: "POL-MOT-COMP-98841",
        policyStartDate: daysAgo(35), // Recent policy
        policyType: "auto",
        policyCoverage: 550000,
        claimDate: daysAgo(7),
        claimAmount: 480000, // 87% coverage ratio
        incidentType: "t_bone_impact",
        description: "2023 Kia Seltos GTX+ (MH-04-KD-7721) - Severe passenger side intrusion and B-pillar deformation allegedly struck by unidentified commercial vehicle in unlit industrial bypass.",
        providerId: "PROV-003",
        providerName: "FastFix Multi-Brand Collision Repair Works (Goregaon West)",
        paymentAccountId: "HDFC-5010049281729", // Shared Account
        status: "open",
      },
      {
        claimId: "CLM-038",
        customerId: "CUST-028",
        customerName: "Karanvir Singh Gill",
        policyId: "POL-MOT-COMP-99120",
        policyStartDate: daysAgo(28), // Recent policy
        policyType: "auto",
        policyCoverage: 500000,
        claimDate: daysAgo(3),
        claimAmount: 455000, // 91% coverage ratio
        incidentType: "rollover_ditch_impact",
        description: "2024 Tata Safari Accomplished+ (MH-02-FG-3019) - Vehicle lost control into drainage culvert. Preliminary surveyor inspection noted preexisting salvage paint marks on suspension control arms.",
        providerId: "PROV-003",
        providerName: "FastFix Multi-Brand Collision Repair Works (Goregaon West)",
        paymentAccountId: "HDFC-5010049281729", // Shared Account
        status: "open",
      },

      // =========================================================================
      // CLUSTER 2: Phantom Clinic Soft-Tissue Inpatient Ring (High Risk: Score 85)
      // Linked via shared payout account ICIC-041201509921 and outlier clinic PROV-006
      // =========================================================================
      {
        claimId: "CLM-031",
        customerId: "CUST-023",
        customerName: "Pooja Bhatt",
        policyId: "POL-HLTH-IND-81204",
        policyStartDate: daysAgo(50), // Recent policy
        policyType: "health",
        policyCoverage: 450000,
        claimDate: daysAgo(9),
        claimAmount: 385000, // 85% coverage
        incidentType: "neuromuscular_rehab",
        description: "Claim for 8-day inpatient cervical decompression, electro-stimulation, and continuous facet joint mobilization. Provider facility audit revealed no licensed overnight patient beds.",
        providerId: "PROV-006",
        providerName: "Sunrise Wellness & Spine Rehabilitation Centre (Chembur)",
        paymentAccountId: "ICIC-041201509921", // Shared Account
        status: "under_review",
      },
      {
        claimId: "CLM-032",
        customerId: "CUST-024",
        customerName: "Rohan Sharma",
        policyId: "POL-HLTH-IND-81933",
        policyStartDate: daysAgo(65), // Recent policy
        policyType: "health",
        policyCoverage: 400000,
        claimDate: daysAgo(14),
        claimAmount: 340000, // 85% coverage
        incidentType: "spinal_decompression",
        description: "Reported acute lumbar radiculopathy requiring high-intensity non-surgical spinal decompression and neuromuscular re-education package without specialist orthopedic referral.",
        providerId: "PROV-006",
        providerName: "Sunrise Wellness & Spine Rehabilitation Centre (Chembur)",
        paymentAccountId: "ICIC-041201509921", // Shared Account
        status: "open",
      },
      {
        claimId: "CLM-041",
        customerId: "CUST-029",
        customerName: "Nikhil Deshmukh",
        policyId: "POL-HLTH-IND-82410",
        policyStartDate: daysAgo(40), // Recent policy
        policyType: "health",
        policyCoverage: 400000,
        claimDate: daysAgo(5),
        claimAmount: 360000, // 90% coverage
        incidentType: "neuromuscular_rehab",
        description: "Claim for acute cervical myofascial pain syndrome and thoracic spine decompression series. Medical reviewer noted template discharge summary identical to CLM-031.",
        providerId: "PROV-006",
        providerName: "Sunrise Wellness & Spine Rehabilitation Centre (Chembur)",
        paymentAccountId: "ICIC-041201509921", // Shared Account
        status: "open",
      },

      // =========================================================================
      // CLUSTER 3: Contractor Shared Payout Property Claims (Medium/High Risk: Score 65)
      // Linked via shared contractor payout account AXIS-918020048192
      // =========================================================================
      {
        claimId: "CLM-039",
        customerId: "CUST-030",
        customerName: "Rajeshwari Venkatraman",
        policyId: "POL-PROP-HOME-55219",
        policyStartDate: daysAgo(350),
        policyType: "property",
        policyCoverage: 800000,
        claimDate: daysAgo(18),
        claimAmount: 380000,
        incidentType: "water_pipe_leak",
        description: "Concealed master bathroom plumbing rupture causing subfloor saturation, damaged engineered wood flooring, and structural hallway gypsum ceiling swelling.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors (Navi Mumbai)",
        paymentAccountId: "AXIS-918020048192", // Shared Contractor Account
        status: "open",
      },
      {
        claimId: "CLM-040",
        customerId: "CUST-031",
        customerName: "Mohammad Tariq Khan",
        policyId: "POL-PROP-HOME-55842",
        policyStartDate: daysAgo(290),
        policyType: "property",
        policyCoverage: 750000,
        claimDate: daysAgo(13),
        claimAmount: 350000,
        incidentType: "storm_roof_damage",
        description: "Monsoon wind shear dislodging terrace waterproofing elastomeric membrane and parapet masonry. Restoration quote routed to contractor billing portal.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors (Navi Mumbai)",
        paymentAccountId: "AXIS-918020048192", // Shared Contractor Account
        status: "open",
      },

      // =========================================================================
      // CLUSTER 4: High Claimant Velocity (Medium Risk: Score 40 - 55)
      // Rohit Mehta (CUST-007) filing 4 claims in 12 months
      // =========================================================================
      {
        claimId: "CLM-010",
        customerId: "CUST-007",
        customerName: "Rohit Mehta",
        policyId: "POL-PROP-HOME-30419",
        policyStartDate: daysAgo(410),
        policyType: "property",
        policyCoverage: 1000000,
        claimDate: daysAgo(250),
        claimAmount: 110000,
        incidentType: "water_pipe_leak",
        description: "Flat 402, Greenfield Heights - Basement subfloor water seepage from cracked vertical plumbing riser pipe.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors (Navi Mumbai)",
        paymentAccountId: "SBIN-30981726451",
        status: "approved",
      },
      {
        claimId: "CLM-011",
        customerId: "CUST-007",
        customerName: "Rohit Mehta",
        policyId: "POL-PROP-HOME-30419",
        policyStartDate: daysAgo(410),
        policyType: "property",
        policyCoverage: 1000000,
        claimDate: daysAgo(160),
        claimAmount: 95000,
        incidentType: "theft_burglary",
        description: "Detached garden equipment room lock forced open; motorized lawn mower and generator equipment stolen.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors (Navi Mumbai)",
        paymentAccountId: "SBIN-30981726451",
        status: "approved",
      },
      {
        claimId: "CLM-012",
        customerId: "CUST-007",
        customerName: "Rohit Mehta",
        policyId: "POL-PROP-HOME-30419",
        policyStartDate: daysAgo(410),
        policyType: "property",
        policyCoverage: 1000000,
        claimDate: daysAgo(70),
        claimAmount: 180000,
        incidentType: "storm_roof_damage",
        description: "Clay roof tile displacement and attic rainwater entry following sudden hail and high wind storm.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors (Navi Mumbai)",
        paymentAccountId: "SBIN-30981726451",
        status: "approved",
      },
      {
        claimId: "CLM-013",
        customerId: "CUST-007",
        customerName: "Rohit Mehta",
        policyId: "POL-PROP-HOME-30419",
        policyStartDate: daysAgo(410),
        policyType: "property",
        policyCoverage: 1000000,
        claimDate: daysAgo(8), // 4th claim!
        claimAmount: 720000, // 72% coverage ratio
        incidentType: "appliance_fire",
        description: "Kitchen range hood electrical surge causing wall cabinetry scorching and smoke damage. Surveyor noted unauthorized manual bypass of 16A circuit breaker.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors (Navi Mumbai)",
        paymentAccountId: "SBIN-30981726451",
        status: "under_review",
      },

      // =========================================================================
      // CLUSTER 5: Recent Inception & High Amount Inquiries (Medium Risk: Score 40 - 55)
      // =========================================================================
      {
        claimId: "CLM-015",
        customerId: "CUST-011",
        customerName: "Kavita Reddy",
        policyId: "POL-MOT-COMP-51920",
        policyStartDate: daysAgo(300),
        policyType: "auto",
        policyCoverage: 600000,
        claimDate: daysAgo(20),
        claimAmount: 490000, // 81% of coverage at outlier garage
        incidentType: "rear_end_collision",
        description: "2023 Maruti Grand Vitara Alpha (MH-03-EB-9112) - Trunk floor pan crumpling and dual rear quarter panel replacement billed by FastFix Auto.",
        providerId: "PROV-003",
        providerName: "FastFix Multi-Brand Collision Repair Works (Goregaon West)",
        paymentAccountId: "HDFC-501002381920",
        status: "open",
      },
      {
        claimId: "CLM-033",
        customerId: "CUST-025",
        customerName: "Harishankar Varma",
        policyId: "POL-PROP-HOME-99124",
        policyStartDate: daysAgo(38), // Recent policy
        policyType: "property",
        policyCoverage: 600000,
        claimDate: daysAgo(11),
        claimAmount: 480000, // 80% coverage
        incidentType: "boundary_wall_collapse",
        description: "Brick compound perimeter boundary wall and automated sliding gate collapsed following monsoon rain saturation.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors (Navi Mumbai)",
        paymentAccountId: "ICIC-041208819230",
        status: "under_review",
      },
      {
        claimId: "CLM-034",
        customerId: "CUST-026",
        customerName: "Devika Nair",
        policyId: "POL-MOT-COMP-77218",
        policyStartDate: daysAgo(42), // Recent policy
        policyType: "auto",
        policyCoverage: 500000,
        claimDate: daysAgo(15),
        claimAmount: 420000, // 84% coverage
        incidentType: "engine_bay_fire",
        description: "2024 Skoda Kushaq Style (MH-02-EA-8822) - Under-hood alternator wiring harness short circuit causing localized thermal fire and dashboard scorching.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet & Auto Services (Andheri East)",
        paymentAccountId: "KKBK-771920381029",
        status: "open",
      },
      {
        claimId: "CLM-042",
        customerId: "CUST-032",
        customerName: "Swati Kulkarni",
        policyId: "POL-HLTH-IND-77192",
        policyStartDate: daysAgo(44), // Recent policy
        policyType: "health",
        policyCoverage: 450000,
        claimDate: daysAgo(10),
        claimAmount: 395000, // 88% coverage
        incidentType: "spinal_decompression",
        description: "Emergency surgical discectomy and 4-day postoperative stay for severe acute L5-S1 nerve root compression.",
        providerId: "PROV-001",
        providerName: "Metro General Super-Specialty Hospital (Kandivali West)",
        paymentAccountId: "IDFB-1002938471",
        status: "under_review",
      },
      {
        claimId: "CLM-043",
        customerId: "CUST-033",
        customerName: "Vivek Anand",
        policyId: "POL-MOT-COMP-66219",
        policyStartDate: daysAgo(210),
        policyType: "auto",
        policyCoverage: 550000,
        claimDate: daysAgo(16),
        claimAmount: 475000, // High ratio at outlier garage
        incidentType: "front_end_collision",
        description: "2023 Honda City e:HEV (MH-01-DK-4411) - Front bumper, radar cruise module, radiator, and hood replacement estimate submitted by FastFix Auto.",
        providerId: "PROV-003",
        providerName: "FastFix Multi-Brand Collision Repair Works (Goregaon West)",
        paymentAccountId: "YESB-0001928374",
        status: "open",
      },

      // =========================================================================
      // CLUSTER 6: Legitimate High-Value Controls (Low Risk: Score 0 - 20)
      // Controls against false positives: High Amount alone != Fraud
      // =========================================================================
      {
        claimId: "CLM-005",
        customerId: "CUST-005",
        customerName: "Ananya Sharma",
        policyId: "POL-PROP-FIRE-10928",
        policyStartDate: daysAgo(1250), // 3.5 year established policy
        policyType: "property",
        policyCoverage: 2500000,
        claimDate: daysAgo(16),
        claimAmount: 850000, // Large amount, but only 34% of coverage!
        incidentType: "structural_fire",
        description: "Ground-floor living area structural fire verified by Mumbai Fire Brigade official department incident report #MB-2026-9182.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors (Navi Mumbai)",
        paymentAccountId: "PUNB-01928472910",
        status: "under_review",
      },
      {
        claimId: "CLM-030",
        customerId: "CUST-022",
        customerName: "Dr. Arvind Nambiar",
        policyId: "POL-HLTH-IND-40912",
        policyStartDate: daysAgo(2100), // 5.7 year established policy
        policyType: "health",
        policyCoverage: 3000000,
        claimDate: daysAgo(28),
        claimAmount: 1150000, // Substantial surgical procedure, but 38% coverage
        incidentType: "coronary_artery_bypass",
        description: "Emergency quadruple coronary artery bypass grafting (CABG x 4) with 6-day ICU critical care monitoring following acute STEMI myocardial infarction.",
        providerId: "PROV-001",
        providerName: "Metro General Super-Specialty Hospital (Kandivali West)",
        paymentAccountId: "BARB-ANDHER0192",
        status: "approved",
      },

      // =========================================================================
      // CLUSTER 7: Clean Baseline Claims (Low Risk: Score 0 - 20)
      // Normal patterns across health, property, and auto
      // =========================================================================
      {
        claimId: "CLM-001",
        customerId: "CUST-001",
        customerName: "Aarav Patel",
        policyId: "POL-HLTH-IND-10144",
        policyStartDate: daysAgo(720),
        policyType: "health",
        policyCoverage: 500000,
        claimDate: daysAgo(30),
        claimAmount: 85000,
        incidentType: "laparoscopic_appendectomy",
        description: "Emergency laparoscopic appendectomy for acute unperforated appendicitis with 24-hour observation stay.",
        providerId: "PROV-001",
        providerName: "Metro General Super-Specialty Hospital (Kandivali West)",
        paymentAccountId: "HDFC-1001481920",
        status: "approved",
      },
      {
        claimId: "CLM-002",
        customerId: "CUST-002",
        customerName: "Priya Nair",
        policyId: "POL-HLTH-IND-10291",
        policyStartDate: daysAgo(540),
        policyType: "health",
        policyCoverage: 400000,
        claimDate: daysAgo(18),
        claimAmount: 62000,
        incidentType: "knee_arthroscopy",
        description: "Right knee medial meniscus partial arthroscopic resection and post-op physical rehabilitation course.",
        providerId: "PROV-002",
        providerName: "Apex Orthopedic & Joint Reconstruction Institute (Vile Parle)",
        paymentAccountId: "ICIC-1002391029",
        status: "approved",
      },
      {
        claimId: "CLM-004",
        customerId: "CUST-004",
        customerName: "Deepak Joshi",
        policyId: "POL-MOT-COMP-20419",
        policyStartDate: daysAgo(850),
        policyType: "auto",
        policyCoverage: 450000,
        claimDate: daysAgo(25),
        claimAmount: 42000,
        incidentType: "windshield_stone_chip",
        description: "2022 Honda City ZX (MH-03-CV-1904) - Flying gravel projectile on Mumbai-Pune Expressway causing star fracture and acoustic laminated windscreen crack.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet & Auto Services (Andheri East)",
        paymentAccountId: "SBIN-1004928172",
        status: "approved",
      },
      {
        claimId: "CLM-006",
        customerId: "CUST-006",
        customerName: "Sneha Sen",
        policyId: "POL-HLTH-IND-30182",
        policyStartDate: daysAgo(600),
        policyType: "health",
        policyCoverage: 300000,
        claimDate: daysAgo(40),
        claimAmount: 38000,
        incidentType: "cranial_mri_series",
        description: "3T high-resolution magnetic resonance cranial angiography series for recurring post-viral vertiginous episodes.",
        providerId: "PROV-005",
        providerName: "ClearView Diagnostic Imaging & MRI Institute (Dadar)",
        paymentAccountId: "AXIS-1006192837",
        status: "approved",
      },
      {
        claimId: "CLM-007",
        customerId: "CUST-008",
        customerName: "Amitabh Roy",
        policyId: "POL-PROP-HOME-40291",
        policyStartDate: daysAgo(900),
        policyType: "property",
        policyCoverage: 1500000,
        claimDate: daysAgo(50),
        claimAmount: 75000,
        incidentType: "pergola_wind_shear",
        description: "Heavy coastal gust winds sheared exterior teak pergola beams and displaced balcony waterproofing tiles.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors (Navi Mumbai)",
        paymentAccountId: "KKBK-1008291029",
        status: "approved",
      },
      {
        claimId: "CLM-008",
        customerId: "CUST-009",
        customerName: "Neha Kapoor",
        policyId: "POL-MOT-COMP-50182",
        policyStartDate: daysAgo(350),
        policyType: "auto",
        policyCoverage: 600000,
        claimDate: daysAgo(14),
        claimAmount: 110000,
        incidentType: "driver_mirror_scrape",
        description: "2023 Hyundai Verna SX (MH-02-DN-5001) - Tight underground mall parking concrete pillar contact damaging motorized mirror housing and blind-spot sensor.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet & Auto Services (Andheri East)",
        paymentAccountId: "HDFC-1009182736",
        status: "approved",
      },
      {
        claimId: "CLM-009",
        customerId: "CUST-010",
        customerName: "Manoj Deshmukh",
        policyId: "POL-HLTH-IND-60219",
        policyStartDate: daysAgo(420),
        policyType: "health",
        policyCoverage: 700000,
        claimDate: daysAgo(11),
        claimAmount: 135000,
        incidentType: "ureteric_lithotripsy",
        description: "Extracorporeal shock wave lithotripsy (ESWL) procedure and temporary ureteral DJ stent placement for 8mm renal calculus.",
        providerId: "PROV-001",
        providerName: "Metro General Super-Specialty Hospital (Kandivali West)",
        paymentAccountId: "ICIC-1010293847",
        status: "open",
      },
      {
        claimId: "CLM-014",
        customerId: "CUST-012",
        customerName: "Ritu Singhania",
        policyId: "POL-HLTH-IND-70381",
        policyStartDate: daysAgo(610),
        policyType: "health",
        policyCoverage: 500000,
        claimDate: daysAgo(29),
        claimAmount: 52000,
        incidentType: "lumbar_disc_mri",
        description: "Multi-sequence lumbar spine MRI protocol confirming L4-L5 left paracentral intervertebral disc herniation.",
        providerId: "PROV-005",
        providerName: "ClearView Diagnostic Imaging & MRI Institute (Dadar)",
        paymentAccountId: "SBIN-1012938475",
        status: "approved",
      },
      {
        claimId: "CLM-016",
        customerId: "CUST-013",
        customerName: "Sanjay Iyer",
        policyId: "POL-PROP-HOME-80129",
        policyStartDate: daysAgo(1100),
        policyType: "property",
        policyCoverage: 1200000,
        claimDate: daysAgo(75),
        claimAmount: 64000,
        incidentType: "tempered_glass_fracture",
        description: "Thermal stress spontaneous fracture on double-glazed toughened sliding balcony glass door.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors (Navi Mumbai)",
        paymentAccountId: "AXIS-1013847562",
        status: "approved",
      },
      {
        claimId: "CLM-017",
        customerId: "CUST-015",
        customerName: "Tara Mukherjee",
        policyId: "POL-MOT-COMP-90182",
        policyStartDate: daysAgo(480),
        policyType: "auto",
        policyCoverage: 350000,
        claimDate: daysAgo(33),
        claimAmount: 48000,
        incidentType: "rear_bumper_fascia",
        description: "2022 Maruti Baleno Alpha (MH-01-CP-9018) - Parallel parking contact requiring rear bumper respray and ultrasonic parking sensor recalibration.",
        providerId: "PROV-009",
        providerName: "Star City Authorized Automotive Workshop (Thane West)",
        paymentAccountId: "KKBK-1015938472",
        status: "approved",
      },
      {
        claimId: "CLM-018",
        customerId: "CUST-001",
        customerName: "Aarav Patel",
        policyId: "POL-HLTH-IND-10144",
        policyStartDate: daysAgo(720),
        policyType: "health",
        policyCoverage: 500000,
        claimDate: daysAgo(190),
        claimAmount: 24000,
        incidentType: "dermatological_excision",
        description: "Benign epidermal inclusion cyst surgical excision and histopathological laboratory confirmation.",
        providerId: "PROV-008",
        providerName: "Lifecare Daycare & Laparoscopic Surgery Centre (Borivali)",
        paymentAccountId: "HDFC-1001481920",
        status: "approved",
      },
      {
        claimId: "CLM-019",
        customerId: "CUST-002",
        customerName: "Priya Nair",
        policyId: "POL-HLTH-IND-10291",
        policyStartDate: daysAgo(540),
        policyType: "health",
        policyCoverage: 400000,
        claimDate: daysAgo(310),
        claimAmount: 18000,
        incidentType: "talonavicular_xray",
        description: "Bilateral standing stress digital radiographs and ultrasonography for chronic plantar fasciitis.",
        providerId: "PROV-005",
        providerName: "ClearView Diagnostic Imaging & MRI Institute (Dadar)",
        paymentAccountId: "ICIC-1002391029",
        status: "approved",
      },
      {
        claimId: "CLM-021",
        customerId: "CUST-011",
        customerName: "Kavita Reddy",
        policyId: "POL-MOT-COMP-51920",
        policyStartDate: daysAgo(300),
        policyType: "auto",
        policyCoverage: 800000,
        claimDate: daysAgo(140),
        claimAmount: 32000,
        incidentType: "vandalism_key_scratch",
        description: "2023 Maruti Grand Vitara Alpha (MH-03-EB-9112) - Deep key scratch repair across passenger front and rear door panels.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet & Auto Services (Andheri East)",
        paymentAccountId: "HDFC-501002381920",
        status: "approved",
      },
      {
        claimId: "CLM-022",
        customerId: "CUST-005",
        customerName: "Ananya Sharma",
        policyId: "POL-PROP-FIRE-10928",
        policyStartDate: daysAgo(1200),
        policyType: "property",
        policyCoverage: 2000000,
        claimDate: daysAgo(500),
        claimAmount: 45000,
        incidentType: "submersible_pump_burnout",
        description: "Basement stormwater submersible sump pump electrical burnout during heavy torrential monsoon surge.",
        providerId: "PROV-004",
        providerName: "Reliable Home & Restoration Contractors (Navi Mumbai)",
        paymentAccountId: "PUNB-01928472910",
        status: "approved",
      },
      {
        claimId: "CLM-023",
        customerId: "CUST-004",
        customerName: "Deepak Joshi",
        policyId: "POL-MOT-COMP-20419",
        policyStartDate: daysAgo(850),
        policyType: "auto",
        policyCoverage: 450000,
        claimDate: daysAgo(420),
        claimAmount: 29000,
        incidentType: "headlamp_lens_replacement",
        description: "2022 Honda City ZX (MH-03-CV-1904) - Cracked passenger side LED projector headlamp housing assembly replacement.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet & Auto Services (Andheri East)",
        paymentAccountId: "SBIN-1004928172",
        status: "approved",
      },
      {
        claimId: "CLM-024",
        customerId: "CUST-006",
        customerName: "Sneha Sen",
        policyId: "POL-HLTH-IND-30182",
        policyStartDate: daysAgo(600),
        policyType: "health",
        policyCoverage: 300000,
        claimDate: daysAgo(210),
        claimAmount: 19500,
        incidentType: "abdominal_doppler_scan",
        description: "High-resolution color Doppler ultrasonography for portal venous hepatic flow assessment.",
        providerId: "PROV-005",
        providerName: "ClearView Diagnostic Imaging & MRI Institute (Dadar)",
        paymentAccountId: "AXIS-1006192837",
        status: "approved",
      },
      {
        claimId: "CLM-025",
        customerId: "CUST-010",
        customerName: "Manoj Deshmukh",
        policyId: "POL-HLTH-IND-60219",
        policyStartDate: daysAgo(420),
        policyType: "health",
        policyCoverage: 700000,
        claimDate: daysAgo(160),
        claimAmount: 44000,
        incidentType: "colles_fracture_splint",
        description: "Closed distal radius Colles fracture reduction and synthetic fiberglass immobilization cast with serial follow-up X-rays.",
        providerId: "PROV-002",
        providerName: "Apex Orthopedic & Joint Reconstruction Institute (Vile Parle)",
        paymentAccountId: "ICIC-1010293847",
        status: "approved",
      },
      {
        claimId: "CLM-026",
        customerId: "CUST-016",
        customerName: "Gaurav Singhal",
        policyId: "POL-MOT-COMP-61102",
        policyStartDate: daysAgo(680),
        policyType: "auto",
        policyCoverage: 400000,
        claimDate: daysAgo(45),
        claimAmount: 38000,
        incidentType: "side_curtain_sensor_fix",
        description: "2022 Tata Nexon EV (MH-02-EQ-6110) - Replaced faulty lateral deceleration crash accelerometer triggering false instrument cluster SRS alert.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet & Auto Services (Andheri East)",
        paymentAccountId: "IDFB-1016928374",
        status: "approved",
      },
      {
        claimId: "CLM-027",
        customerId: "CUST-017",
        customerName: "Meenakshi Pillai",
        policyId: "POL-PROP-HOME-72019",
        policyStartDate: daysAgo(520),
        policyType: "property",
        policyCoverage: 800000,
        claimDate: daysAgo(62),
        claimAmount: 51000,
        incidentType: "terrace_waterproofing",
        description: "Elastomeric liquid membrane sealing over hairline reinforced concrete terrace slab cracks after monsoon.",
        providerId: "PROV-010",
        providerName: "Apex Structural Builders & Waterproofing Works (Vashi)",
        paymentAccountId: "UTIB-1017928374",
        status: "approved",
      },
      {
        claimId: "CLM-029",
        customerId: "CUST-018",
        customerName: "Naveen Chawla",
        policyId: "POL-HLTH-IND-44510",
        policyStartDate: daysAgo(380),
        policyType: "health",
        policyCoverage: 500000,
        claimDate: daysAgo(55),
        claimAmount: 68000,
        incidentType: "cataract_phacoemulsification",
        description: "Left eye micro-incision phacoemulsification cataract extraction with foldable hydrophobic acrylic intraocular lens implantation.",
        providerId: "PROV-008",
        providerName: "Lifecare Daycare & Laparoscopic Surgery Centre (Borivali)",
        paymentAccountId: "HDFC-1018928374",
        status: "approved",
      },
      {
        claimId: "CLM-035",
        customerId: "CUST-020",
        customerName: "Bhavna Bhattacharya",
        policyId: "POL-MOT-COMP-33102",
        policyStartDate: daysAgo(450),
        policyType: "auto",
        policyCoverage: 350000,
        claimDate: daysAgo(38),
        claimAmount: 26000,
        incidentType: "tail_light_assembly",
        description: "2021 Toyota Urban Cruiser (MH-03-BN-3310) - Reversing contact into low tree branch breaking outer passenger LED tail lamp lens.",
        providerId: "PROV-009",
        providerName: "Star City Authorized Automotive Workshop (Thane West)",
        paymentAccountId: "ICIC-1020938471",
        status: "approved",
      },
      {
        claimId: "CLM-036",
        customerId: "CUST-027",
        customerName: "Gurpreet Singh Dhillon",
        policyId: "POL-MOT-COMP-49102",
        policyStartDate: daysAgo(510),
        policyType: "auto",
        policyCoverage: 650000,
        claimDate: daysAgo(21),
        claimAmount: 54000,
        incidentType: "radiator_support_repair",
        description: "2023 Mahindra Scorpio-N Z8 (MH-14-GH-4910) - Low-speed speed-breaker contact bending lower radiator support beam and underbody skid plate.",
        providerId: "PROV-007",
        providerName: "National Precision Fleet & Auto Services (Andheri East)",
        paymentAccountId: "SBIN-1027938472",
        status: "approved",
      },
      {
        claimId: "CLM-037",
        customerId: "CUST-019",
        customerName: "Siddharth Bose",
        policyId: "POL-HLTH-IND-51209",
        policyStartDate: daysAgo(330),
        policyType: "health",
        policyCoverage: 500000,
        claimDate: daysAgo(48),
        claimAmount: 78000,
        incidentType: "dengue_fever_inpatient",
        description: "Inpatient admission for acute dengue fever with severe thrombocytopenia requiring 4 days intravenous hydration and platelet monitoring.",
        providerId: "PROV-001",
        providerName: "Metro General Super-Specialty Hospital (Kandivali West)",
        paymentAccountId: "AXIS-1019928374",
        status: "approved",
      },
      {
        claimId: "CLM-044",
        customerId: "CUST-034",
        customerName: "Preeti Agarwal",
        policyId: "POL-PROP-HOME-88219",
        policyStartDate: daysAgo(640),
        policyType: "property",
        policyCoverage: 1100000,
        claimDate: daysAgo(36),
        claimAmount: 58000,
        incidentType: "water_pipe_leak",
        description: "Kitchen under-sink flex hose failure causing localized laminate base cabinet swelling and tile grout washing.",
        providerId: "PROV-010",
        providerName: "Apex Structural Builders & Waterproofing Works (Vashi)",
        paymentAccountId: "KKBK-1034928371",
        status: "approved",
      },
      {
        claimId: "CLM-045",
        customerId: "CUST-035",
        customerName: "Kiranmai Rao",
        policyId: "POL-HLTH-IND-91823",
        policyStartDate: daysAgo(490),
        policyType: "health",
        policyCoverage: 600000,
        claimDate: daysAgo(27),
        claimAmount: 92000,
        incidentType: "laparoscopic_cholecystectomy",
        description: "Elective 3-port laparoscopic cholecystectomy for symptomatic cholelithiasis with smooth 36-hour recovery.",
        providerId: "PROV-008",
        providerName: "Lifecare Daycare & Laparoscopic Surgery Centre (Borivali)",
        paymentAccountId: "HDFC-1035928374",
        status: "approved",
      },
    ];

    const insertedClaims = await Claim.insertMany(claimsData);
    console.log(`Inserted ${insertedClaims.length} realistic claims.`);

    // 4. Seed Pre-existing Investigations with Rich Real-World Forensic Case Notes
    console.log("Seeding Investigations...");
    await Investigation.insertMany([
      {
        claimId: "CLM-003",
        status: "under_investigation",
        notes: [
          {
            text: "Automated Intake Screener: High Risk alert triggered. Claim filed within 22 days of policy inception. FastFix Auto is an un-empanelled outlier repair facility. Beneficiary payout account HDFC-5010049281729 matches 3 other open motor collision claims.",
            author: "Automated SIU Screener",
            createdAt: daysAgo(4),
          },
          {
            text: "Karan Malhotra (Senior Field Investigator): Conducted physical inspection at FastFix Auto Repair Works. The Mahindra XUV700 was not in the paint booth despite a ₹1,40,000 multi-coat respray line item. Front bumper assembly showed preexisting salvage paint markings and mismatched VIN stamps.",
            author: "Karan Malhotra (Senior Field Investigator)",
            createdAt: daysAgo(3),
          },
          {
            text: "Maya Chen (Lead SIU Analyst): Requested NHAI Western Express Highway toll plaza ANPR camera feeds. FastFix flatbed tow truck was recorded crossing Dahisar toll booth 3 hours before the alleged collision time. Evidence strongly indicates a staged crash. Case escalated to Fraud Operations.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(1),
          },
        ],
        outcome: "",
        updatedAt: daysAgo(1),
      },
      {
        claimId: "CLM-020",
        status: "under_investigation",
        notes: [
          {
            text: "Automated Intake Screener: High Risk alert. 81% sum insured claimed within 45 days of policy purchase. Linked to shared account HDFC-5010049281729 and garage PROV-003.",
            author: "Automated SIU Screener",
            createdAt: daysAgo(11),
          },
          {
            text: "Maya Chen (Lead SIU Analyst): Contacted claimant for telephonic statement regarding stationary barrier collision on Jogeshwari Link Road. Claimant could not state the direction of travel or names of witnesses.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(8),
          },
          {
            text: "Karan Malhotra (Senior Field Investigator): Municipal traffic control room verified no barrier repairs or accident dispatch at the specified intersection on that date.",
            author: "Karan Malhotra (Senior Field Investigator)",
            createdAt: daysAgo(2),
          },
        ],
        outcome: "",
        updatedAt: daysAgo(2),
      },
      {
        claimId: "CLM-031",
        status: "under_investigation",
        notes: [
          {
            text: "Automated Intake Screener: High Risk alert. Health claim filed within 50 days of policy inception. Provider Sunrise Wellness & Spine Rehabilitation is billing 4.5x the regional physiotherapy clinic benchmark. Payout account ICIC-041201509921 is shared with CLM-032 and CLM-041.",
            author: "Automated SIU Screener",
            createdAt: daysAgo(8),
          },
          {
            text: "Dr. Anirudh Joshi (Medical Claims Reviewer): Audited hospital inpatient admission documentation. Sunrise Wellness operates only as a 3-bed daytime physiotherapy facility with no licensed inpatient beds, ICU backup, or resident anesthesiologist. Inpatient billing for 8 days is fabricated.",
            author: "Dr. Anirudh Joshi (Medical Claims Reviewer)",
            createdAt: daysAgo(5),
          },
          {
            text: "Maya Chen (Lead SIU Analyst): Issued formal notice to claimant requesting verifiable diagnostic MRI plates and original prescription from an empanelled neurosurgeon. No response received within 72 hours.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(2),
          },
        ],
        outcome: "",
        updatedAt: daysAgo(2),
      },
      {
        claimId: "CLM-013",
        status: "under_investigation",
        notes: [
          {
            text: "Automated Intake Screener: High claimant velocity alert. Customer Rohit Mehta has filed 4 distinct property loss claims within 12 months, aggregating ₹10,95,000 on a ₹10,00,000 policy limit.",
            author: "Automated SIU Screener",
            createdAt: daysAgo(7),
          },
          {
            text: "Maya Chen (Lead SIU Analyst): Field surveyor inspected kitchen range hood fire. Electrical panel shows unauthorized manual bypass of 16A circuit breaker. Claimant submitted replacement quote from Reliable Home Contractors; currently verifying equipment purchase invoices.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(3),
          },
        ],
        outcome: "",
        updatedAt: daysAgo(3),
      },
      {
        claimId: "CLM-008",
        status: "cleared",
        notes: [
          {
            text: "Routine Screening: Minor side mirror scrape flagged for review due to repair garage's elevated average billing profile.",
            author: "Automated SIU Screener",
            createdAt: daysAgo(13),
          },
          {
            text: "Maya Chen (Lead Fraud Analyst): Customer provided continuous dashcam video and timestamped security log from Phoenix Mall underground parking showing low-speed concrete pillar contact.",
            author: "Maya Chen (Lead Fraud Analyst)",
            createdAt: daysAgo(6),
          },
        ],
        outcome: "Cleared — Legitimate single-vehicle parking incident verified via third-party parking surveillance and synchronized dashcam footage.",
        updatedAt: daysAgo(6),
      },
    ]);

    console.log("Database seeded successfully with rich, realistic, professional insurance fraud intelligence data!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedData();
