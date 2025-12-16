import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    topic: { type: String, default: '' },
    assessmentName: String,
    moduleNumber: String,
    moduleName: String,
    content: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chatHistory: [{
        role: { type: String, enum: ['user', 'assistant'] },
        content: String,
        timestamp: { type: Date, default: Date.now }
    }],
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

export const Assignment = mongoose.model('Assignment', assignmentSchema);
