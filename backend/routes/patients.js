// routes/patients.js
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { User, PatientHistory } = require('../models');
const { protect } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random()*1e6)}`;
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf','.jpg','.jpeg','.png'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF, JPG, PNG files allowed'));
  }
});

// GET profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name email phone dateOfBirth bloodGroup medicalNotes allergies createdAt')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.id = user._id;
    user.phone = decrypt(user.phone);
    user.bloodGroup = decrypt(user.bloodGroup);
    user.medicalNotes = decrypt(user.medicalNotes);
    user.allergies = decrypt(user.allergies);
    res.json(user);
  } catch (err) { 
    console.error('Profile GET error:', err);
    res.status(500).json({ message: err.message }); 
  }
});

// UPDATE profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, bloodGroup, medicalNotes, allergies, dateOfBirth } = req.body;
    
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone: encrypt(phone),
        bloodGroup: encrypt(bloodGroup),
        medicalNotes: encrypt(medicalNotes),
        allergies: encrypt(allergies),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
      },
      { new: true }
    );

    res.json({ 
      message: 'Profile updated', 
      user: { 
        id: updated._id, 
        name: updated.name, 
        email: updated.email,
        phone: decrypt(updated.phone),
        bloodGroup: decrypt(updated.bloodGroup),
        medicalNotes: decrypt(updated.medicalNotes),
        allergies: decrypt(updated.allergies),
        dateOfBirth: updated.dateOfBirth
      } 
    });
  } catch (err) {
    console.error('Profile PUT error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET history
router.get('/history', protect, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { userId: req.user.id };
    if (type) filter.type = type;
    
    let history = await PatientHistory.find(filter).sort({ date: -1 }).lean();
    history = history.map(h => ({
      ...h,
      id: h._id,
      diagnosis: decrypt(h.diagnosis),
      notes: decrypt(h.notes)
    }));
    res.json({ count: history.length, history });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST history + optional file
router.post('/history', protect, upload.single('file'), async (req, res) => {
  try {
    const { type, date, doctorName, hospital, diagnosis, notes } = req.body;
    const entry = await PatientHistory.create({
      userId: req.user.id,
      type, 
      date: date ? new Date(date) : new Date(), 
      doctorName, 
      hospital, 
      diagnosis: encrypt(diagnosis), 
      notes: encrypt(notes),
      fileUrl: req.file ? `/${process.env.UPLOAD_DIR || 'uploads'}/${req.file.filename}` : null,
      fileName: req.file ? req.file.originalname : null,
    });
    const obj = entry.toObject();
    obj.id = obj._id;
    obj.diagnosis = decrypt(obj.diagnosis);
    obj.notes = decrypt(obj.notes);
    res.status(201).json(obj);
  } catch (err) { 
    console.error('History POST error:', err);
    res.status(400).json({ message: err.message }); 
  }
});

// POST AI summary for a record
router.post('/history/:id/summarize', protect, async (req, res) => {
  try {
    const record = await PatientHistory.findOne({ _id: req.params.id, userId: req.user.id });
    if (!record) return res.status(404).json({ message: 'Record not found' });

    // Use global fetch or node-fetch
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Fixed model name to claude-3-haiku
        max_tokens: 400,
        system: 'You are a medical record summarizer. Summarize in 3-4 bullet points. Note abnormal values. Always end with: Consult your doctor for medical advice.',
        messages: [{
          role: 'user',
          content: `Summarize: Type: ${record.type} | Doctor: ${record.doctorName} | Date: ${record.date} | Notes: ${decrypt(record.notes)}`
        }]
      })
    });

    const data = await response.json();
    const summary = data.content?.[0]?.text || 'Unable to generate summary.';
    
    await PatientHistory.findByIdAndUpdate(record._id, { aiSummary: summary });
    
    res.json({ summary });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE record
router.delete('/history/:id', protect, async (req, res) => {
  try {
    const entry = await PatientHistory.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!entry) return res.status(404).json({ message: 'Record not found' });
    
    await PatientHistory.findByIdAndDelete(entry._id);
    
    // Delete file if exists
    if (entry.fileUrl) {
      const filePath = path.join(__dirname, '..', entry.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ message: 'Record deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
