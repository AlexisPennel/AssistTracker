import mongoose from 'mongoose'

const StudentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
  },
  // Le champ price a été supprimé d'ici car il est maintenant géré par créneau (Schedule)

  notes: [
    {
      content: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Student || mongoose.model('Student', StudentSchema)
