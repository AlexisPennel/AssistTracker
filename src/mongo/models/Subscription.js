// Modèle pour les notifications push
import mongoose from 'mongoose'

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // Un utilisateur = un abonnement push (le plus récent)
    },
    subscription: {
      type: Object, // Contient l'endpoint, les clés p256dh et auth
      required: true,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema)
