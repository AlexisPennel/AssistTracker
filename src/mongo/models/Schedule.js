// @/models/Schedule.js
import mongoose from 'mongoose'

const ScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  occurrence: {
    type: String,
    enum: ['weekly', 'once'],
    default: 'weekly',
  },
  // --- NOUVEAU CHAMP ---
  
  price: {
    type: Number,
    required: true,
    default: 50, // Sécurité : si rien n'est passé, on garde ta base de 50
  },
  // ---------------------
  date: {
    type: Date,
    required: function () {
      return this.occurrence === 'once'
    },
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    required: function () {
      return this.occurrence === 'weekly'
    },
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
})

export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema)
