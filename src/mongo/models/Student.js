import mongoose from 'mongoose'

const StudentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // El modelo de tu auth
    required: true,
  },
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
  },
  // Nueva propiedad para el costo de la clase
  price: {
    type: Number,
    required: [true, 'La tarifa es obligatoria'],
    min: [0, 'La tarifa no puede ser negativa'],
    default: 0,
  },
  // Tabla de notas/comentarios
  notes: [
    {
      content: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Estado del alumno (por si deja de venir)
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Tip: Si planeas buscar mucho por nombre, podrías añadir un índice
// StudentSchema.index({ name: 1 });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema)
