import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    profileImage: { type: String },
});

const User = mongoose.model('User', userSchema);
export default User;
