import express from 'express';
import { Assignment } from '../models/Assignment.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all assignments for the logged-in user
router.get('/', verifyToken, async (req, res) => {
    try {
        const assignments = await Assignment.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create assignment
router.post('/', verifyToken, async (req, res) => {
    try {
        const assignment = new Assignment({
            ...req.body,
            userId: req.user._id,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await assignment.save();
        res.status(201).json(assignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update assignment
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedAssignment = await Assignment.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        if (!updatedAssignment) return res.status(404).json({ message: 'Assignment not found' });
        res.json(updatedAssignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single assignment
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id });
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        res.json(assignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete assignment
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const deletedAssignment = await Assignment.findOneAndDelete(
            { _id: req.params.id, userId: req.user._id }
        );
        if (!deletedAssignment) return res.status(404).json({ message: 'Assignment not found' });
        res.json({ message: 'Assignment deleted successfully', id: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add chat message
router.post('/:id/chat', verifyToken, async (req, res) => {
    try {
        const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id });
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        assignment.chatHistory.push(req.body);
        await assignment.save();
        res.json(assignment.chatHistory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
