const express = require('express');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /notifications — list for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const onlyUnread = req.query.unread === 'true';

    const filter = { userId: req.user.id };
    if (onlyUnread) filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
    ]);

    res.json({ notifications, total, unreadCount, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('List notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /notifications/unread-count — lightweight badge endpoint
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get count' });
  }
});

// PUT /notifications/:id/read — mark one as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Marked as read', notification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PUT /notifications/read-all — mark all as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All marked as read', modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// DELETE /notifications/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// POST /notifications/internal — called by other services (no user auth required)
router.post('/internal', async (req, res) => {
  try {
    const { userId, type, title, message, metadata } = req.body;
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ error: 'userId, type, title, message are required' });
    }
    const notification = await Notification.create({ userId, type, title, message, metadata });
    res.status(201).json({ notification });
  } catch (err) {
    console.error('Create notification error:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

module.exports = router;
