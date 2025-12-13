import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import assignmentRoutes from './routes/assignments.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/ai', aiRoutes);

// Connect to MongoDB (Local Compass URL)
// You can override this with process.env.MONGO_URI if needed
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/assignmentor';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Local'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('Assignmentor API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
