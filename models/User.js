import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

// Si le modèle a déjà été créé, on fait juste mongoose.models.User
// Si pas, on le crée en avec mongoose.model('User', userSchema)
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
