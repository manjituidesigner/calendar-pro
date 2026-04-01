import express from 'express';
import { createCalendar, getCalendars, updateCalendar, deleteCalendar, shareCalendar } from '../controllers/calendarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createCalendar)
  .get(protect, getCalendars);

router.route('/:id')
  .put(protect, updateCalendar)
  .delete(protect, deleteCalendar);

router.route('/:id/share')
  .post(protect, shareCalendar);

export default router;
