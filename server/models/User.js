import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Added password field for auth
    rollNumber: String,
    course: String,
    collegeName: String,
    section: String,
    semester: String,
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password; // Also hide password
        }
    }
});

export const User = mongoose.model('User', userSchema);
