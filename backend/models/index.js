// models/index.js — All 6 Mongoose schemas
const mongoose = require('mongoose');

// ── User ─────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  phone:        { type: String },
  dateOfBirth:  { type: Date },
  bloodGroup:   { type: String },
  medicalNotes: { type: String },
  allergies:    { type: String },
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

// ── Hospital ─────────────────────────────────────────
const hospitalSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  district:         { type: String },
  taluk:            { type: String },
  address:          { type: String },
  phone:            { type: String },
  email:            { type: String },
  type:             { type: String, default: 'Private' },
  lat:              { type: Number },
  lng:              { type: Number },
  location:         {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }  // [lng, lat]
  },
  specialities:     { type: [String], default: [] },
  schemesSupported: { type: [String], default: [] },
  rating:           { type: Number },
  totalRatings:     { type: Number, default: 0 },
  timings:          { type: String },
  isVerified:       { type: Boolean, default: false },
  source:           { type: String, default: 'csv' },
}, { timestamps: true });

hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ district: 1 });

// Auto-populate location from lat/lng on save
hospitalSchema.pre('save', function(next) {
  if (this.lat != null && this.lng != null) {
    this.location = { type: 'Point', coordinates: [this.lng, this.lat] };
  }
  next();
});

// ── Diagnostic ───────────────────────────────────────
const diagnosticSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  address:        { type: String },
  phone:          { type: String },
  lat:            { type: Number },
  lng:            { type: Number },
  location:       {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  testsAvailable: { type: [String], default: [] },
  rating:         { type: Number },
  timings:        { type: String },
  homeCollection: { type: Boolean, default: false },
  isVerified:     { type: Boolean, default: false },
}, { timestamps: true });

diagnosticSchema.index({ location: '2dsphere' });

diagnosticSchema.pre('save', function(next) {
  if (this.lat != null && this.lng != null) {
    this.location = { type: 'Point', coordinates: [this.lng, this.lat] };
  }
  next();
});

// ── BloodBank ────────────────────────────────────────
const bloodBankSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  address:    { type: String },
  phone:      { type: String },
  lat:        { type: Number },
  lng:        { type: Number },
  location:   {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  timings:    { type: String },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

bloodBankSchema.index({ location: '2dsphere' });

bloodBankSchema.pre('save', function(next) {
  if (this.lat != null && this.lng != null) {
    this.location = { type: 'Point', coordinates: [this.lng, this.lat] };
  }
  next();
});

// ── PatientHistory ───────────────────────────────────
const patientHistorySchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:       { type: String, required: true },
  date:       { type: Date, default: Date.now },
  doctorName: { type: String },
  hospital:   { type: String },
  diagnosis:  { type: String },
  notes:      { type: String },
  fileUrl:    { type: String },
  fileName:   { type: String },
  aiSummary:  { type: String },
  medicines:  { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

patientHistorySchema.index({ userId: 1, date: -1 });

// ── SymptomLog ───────────────────────────────────────
const symptomLogSchema = new mongoose.Schema({
  userId:                 { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  symptoms:               { type: [String], default: [] },
  severityScore:          { type: Number },
  severity:               { type: String },
  possibleConditions:     { type: [String], default: [] },
  recommendedSpecialists: { type: [String], default: [] },
  scoringFactors:         { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// ── Export Models ─────────────────────────────────────
const User           = mongoose.model('User', userSchema);
const Hospital       = mongoose.model('Hospital', hospitalSchema);
const Diagnostic     = mongoose.model('Diagnostic', diagnosticSchema);
const BloodBank      = mongoose.model('BloodBank', bloodBankSchema);
const PatientHistory = mongoose.model('PatientHistory', patientHistorySchema);
const SymptomLog     = mongoose.model('SymptomLog', symptomLogSchema);

module.exports = { User, Hospital, Diagnostic, BloodBank, PatientHistory, SymptomLog };
