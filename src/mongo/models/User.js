import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  // ======================
  // IDENTITÉ
  // ======================
  firstName: {
    type: String,
    trim: true,
  },

  lastName: {
    type: String,
    trim: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },

  image: String,

  role: {
    type: String,
    default: 'user',
  },

  // ======================
  // AUTH (Credentials)
  // ======================
  password: {
    type: String,
    select: false,
  },

  // ======================
  // CONSENTEMENTS
  // ======================
  newsletter: {
    type: Boolean,
    default: false,
  },

  cgvAccepted: {
    type: Boolean,
    default: false,
  },

  cguAccepted: {
    type: Boolean,
    default: false,
  },

  termsAcceptedAt: {
    type: Date,
    default: Date.now,
  },

  // ======================
  // PROVIDER AUTH
  // ======================
  provider: {
    type: String,
    enum: ['google', 'credentials'],
    default: 'credentials',
  },

  // ======================
  // MÉTA
  // ======================
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Onboarding
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
