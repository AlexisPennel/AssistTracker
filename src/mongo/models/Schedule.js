// @/models/Schedule.js
import mongoose from 'mongoose'

const ScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // El modelo de tu auth
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
  // Solo se usa si occurrence es 'once'
  date: {
    type: Date,
    required: function () {
      return this.occurrence === 'once'
    },
  },
  // Solo se usa si occurrence es 'weekly'
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
