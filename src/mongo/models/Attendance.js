import mongoose from 'mongoose'

const AttendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'pending', 'canceled'], // Statut 'canceled' ajouté
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
)

AttendanceSchema.index({ scheduleId: 1, date: 1 }, { unique: true })

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema)
