// routes/symptoms.js
// POST /api/symptoms/analyze
const express = require("express");
const router = express.Router();
const { User, Hospital, SymptomLog } = require("../models");
const { decrypt } = require("../utils/encryption");
const { protect } = require("../middleware/auth");

// Symptom → Condition + Specialist mapping (Deterministic fallback/safety check)
const SYMPTOM_DB = {
  fever: {
    conditions: ["Viral Fever", "Malaria", "Dengue", "Typhoid", "COVID-19"],
    specialists: ["General Physician", "Infectious Disease Specialist"],
    csvSpec: "GENERAL MEDICINE",
  },
  headache: {
    conditions: ["Migraine", "Tension Headache", "Hypertension", "Sinusitis"],
    specialists: ["Neurologist", "General Physician"],
    csvSpec: "NEUROSURGERY",
  },
  "chest pain": {
    conditions: ["Angina", "GERD", "Costochondritis", "Pericarditis"],
    specialists: ["Cardiologist", "Gastroenterologist"],
    csvSpec: "CARDIOLOGY",
  },
  cough: {
    conditions: ["Common Cold", "Bronchitis", "Asthma", "Tuberculosis"],
    specialists: ["Pulmonologist", "General Physician"],
    csvSpec: "PULMONOL",
  },
  breathlessness: {
    conditions: ["Asthma", "COPD", "Heart Failure", "Anemia"],
    specialists: ["Pulmonologist", "Cardiologist"],
    csvSpec: "CARDIOLOGY",
  },
  "stomach pain": {
    conditions: ["Gastritis", "Appendicitis", "IBS", "Peptic Ulcer"],
    specialists: ["Gastroenterologist", "General Surgeon"],
    csvSpec: "GENERAL SURGERY",
  },
  "joint pain": {
    conditions: ["Osteoarthritis", "Rheumatoid Arthritis", "Gout"],
    specialists: ["Orthopedist", "Rheumatologist"],
    csvSpec: "ORTHOPAEDICS",
  },
  "back pain": {
    conditions: ["Muscle Strain", "Disc Herniation", "Spondylitis"],
    specialists: ["Orthopedist", "Nephrologist"],
    csvSpec: "ORTHOPAEDICS",
  },
  fatigue: {
    conditions: ["Anemia", "Thyroid Disorder", "Diabetes", "Depression"],
    specialists: ["General Physician", "Endocrinologist"],
    csvSpec: "GENERAL MEDICINE",
  },
  "skin rash": {
    conditions: ["Allergy", "Eczema", "Psoriasis", "Chickenpox"],
    specialists: ["Dermatologist", "Allergist"],
    csvSpec: "DERMATOL",
  },
  "eye problem": {
    conditions: ["Conjunctivitis", "Cataract", "Glaucoma"],
    specialists: ["Ophthalmologist"],
    csvSpec: "OPHTHALMOLOGY",
  },
  "frequent urination": {
    conditions: ["Diabetes", "UTI", "Prostate Issues"],
    specialists: ["Urologist", "Diabetologist"],
    csvSpec: "UROLOGY",
  },
  "kidney pain": {
    conditions: [
      "Kidney Stones",
      "Urinary Tract Infection (UTI)",
      "Kidney Infection (Pyelonephritis)",
      "Polycystic Kidney Disease",
      "Hydronephrosis",
    ],
    specialists: ["Urologist", "Nephrologist"],
    csvSpec: "UROLOGY / NEPHROLOGY",
  },
};

// Weighted scoring formula
function calcScore(factors) {
  const { duration = 2, pain = 2, frequency = 2, impact = 2 } = factors;
  return Math.round(
    (pain * 35 + impact * 30 + duration * 20 + frequency * 15) / 5,
  );
}

// Optional Auth Middleware for symptom analysis
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      req.user = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    } catch (e) {
      // Ignore invalid token, proceed as guest
    }
  }
  next();
};

router.post("/analyze", optionalAuth, async (req, res) => {
  try {
    const { symptoms = [], scoringFactors = {}, location, lang = "en" } = req.body;
    if (!symptoms.length)
      return res.status(400).json({ message: "Provide at least one symptom" });

    // 1. Deterministic Calculation
    const condSet = new Set(), specSet = new Set();
    let primarySpec = "";

    symptoms.forEach((s) => {
      const k = s.toLowerCase();
      Object.keys(SYMPTOM_DB).forEach((key) => {
        if (key.includes(k) || k.includes(key)) {
          SYMPTOM_DB[key].conditions.forEach((c) => condSet.add(c));
          SYMPTOM_DB[key].specialists.forEach((sp) => specSet.add(sp));
          if (!primarySpec) primarySpec = SYMPTOM_DB[key].csvSpec;
        }
      });
    });

    let conditions = [...condSet].slice(0, 5);
    let specialists = [...specSet].slice(0, 4);
    const score = calcScore(scoringFactors);
    const severity = score >= 65 ? "severe" : score >= 35 ? "moderate" : "mild";

    // 2. Advanced AI Differential Analysis (with Patient Context)
    let aiReasoning = "Based on basic symptom matching.";
    try {
      let patientContext = "";
      if (req.user?.id) {
        const user = await User.findById(req.user.id);
        if (user) {
          const age = user.dateOfBirth ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25)) : "N/A";
          patientContext = `Patient Profile: Age: ${age}, Blood Group: ${decrypt(user.bloodGroup) || 'Unknown'}, Allergies: ${decrypt(user.allergies) || 'None reported'}, Medical Notes: ${decrypt(user.medicalNotes) || 'None'}.`;
        }
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620', // Upgraded model for better accuracy
          max_tokens: 600,
          system: `You are an advanced medical diagnostic assistant (AyuSutra AI). 
          ${patientContext}
          Analyze the user's symptoms: ${symptoms.join(', ')}. 
          Severity score: ${score}/100. 
          Provide a detailed differential analysis including:
          1. Potential conditions (most likely to least likely).
          2. Rationale for these conditions based on symptoms and patient context.
          3. Recommended medical specialists.
          4. Immediate steps or red flags to watch for.
          Language: ${lang}.
          
          IMPORTANT: You are NOT a doctor. Do NOT provide a final diagnosis. Start your response with a disclaimer that this is for educational purposes only.`,
          messages: [{ role: 'user', content: 'Analyze my symptoms and provide a comprehensive differential report.' }]
        })
      });
      const data = await response.json();
      if (data.content && data.content[0]) {
        aiReasoning = data.content[0].text;
      }
    } catch (e) {
      console.error("AI Analysis failed:", e);
    }

    // 3. Find nearby hospitals using MongoDB geo query
    let hospitals = [];
    if (location?.lat && location?.lng) {
      const lat = parseFloat(location.lat);
      const lng = parseFloat(location.lng);

      // Try $near geo query first
      try {
        let query = {
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [lng, lat] },
              $maxDistance: 20000 // 20km in meters
            }
          }
        };
        if (primarySpec) {
          query.specialities = { $regex: primarySpec, $options: 'i' };
        }
        hospitals = await Hospital.find(query).limit(5).lean();
        hospitals = hospitals.map(h => ({
          ...h,
          id: h._id,
          distance: calculateHaversine(lat, lng, h.lat, h.lng)
        }));
      } catch (geoErr) {
        // Fallback: JS-based filtering
        const allHospitals = await Hospital.find({
          lat: { $ne: null },
          lng: { $ne: null }
        }).lean();

        hospitals = allHospitals.map(h => ({
          ...h,
          id: h._id,
          distance: calculateHaversine(lat, lng, h.lat, h.lng)
        }))
        .filter(h => {
          const matchesSpec = primarySpec ? JSON.stringify(h.specialities).toLowerCase().includes(primarySpec.toLowerCase()) : true;
          return h.distance < 20 && matchesSpec;
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);
      }
    }

    // 4. Log (optional — only if authenticated)
    if (req.user?.id) {
      await SymptomLog.create({
        userId: req.user.id,
        symptoms,
        severityScore: score,
        severity,
        possibleConditions: conditions,
        recommendedSpecialists: specialists,
        scoringFactors,
      });
    }

    res.json({
      symptoms,
      severityScore: score,
      severity,
      possibleConditions: conditions,
      recommendedSpecialists: specialists,
      aiAnalysis: aiReasoning,
      nearbyHospitals: hospitals,
      disclaimer: "MEDICAL DISCLAIMER: This information is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your doctor or emergency services (112/108) immediately.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Haversine helper
function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

module.exports = router;
