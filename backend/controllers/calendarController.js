import Calendar from '../models/Calendar.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';

export const createCalendar = async (req, res) => {
  try {
    const { name, category, description, pin, isPrivate } = req.body;
    const calendar = new Calendar({
      owner: req.user._id,
      name, category, description, pin, isPrivate
    });
    await calendar.save();
    res.status(201).json(calendar);
  } catch (error) {
    res.status(500).json({ message: "Failed to create calendar", error: error.message });
  }
};

export const getCalendars = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find calendars owned by user OR shared with user
    const calendars = await Calendar.find({
      $or: [
        { owner: userId },
        { "permissions.userId": userId }
      ]
    }).populate('owner', 'username email');
    res.status(200).json(calendars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch calendars", error: error.message });
  }
};

export const updateCalendar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, pin, isPrivate } = req.body;

    const calendar = await Calendar.findOne({ _id: id, owner: req.user._id });
    if (!calendar) return res.status(404).json({ message: "Calendar not found or unauthorized" });

    calendar.name = name || calendar.name;
    calendar.category = category || calendar.category;
    calendar.description = description || calendar.description;
    calendar.pin = pin || calendar.pin;
    calendar.isPrivate = isPrivate !== undefined ? isPrivate : calendar.isPrivate;

    await calendar.save();
    res.status(200).json(calendar);
  } catch (error) {
    res.status(500).json({ message: "Failed to update calendar", error: error.message });
  }
};

export const deleteCalendar = async (req, res) => {
  try {
    const { id } = req.params;
    const calendar = await Calendar.findOneAndDelete({ _id: id, owner: req.user._id });
    
    if (!calendar) return res.status(404).json({ message: "Calendar not found or unauthorized" });

    // Also delete all expenses associated with this calendar
    await Expense.deleteMany({ calendarId: id });

    res.status(200).json({ message: "Calendar and associated expenses deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete calendar", error: error.message });
  }
};

export const shareCalendar = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, rights } = req.body; // Share by email

    const calendar = await Calendar.findOne({ _id: id, owner: req.user._id });
    if (!calendar) return res.status(404).json({ message: "Calendar not found or unauthorized" });

    const userToShare = await User.findOne({ email });
    if (!userToShare) return res.status(404).json({ message: "User with this email not found" });

    // Check if already shared
    const existingPermission = calendar.permissions.find(p => p.userId.equals(userToShare._id));
    if (existingPermission) {
      existingPermission.rights = rights;
    } else {
      calendar.permissions.push({ userId: userToShare._id, rights });
    }

    await calendar.save();
    res.status(200).json({ message: "Calendar shared successfully", calendar });
  } catch (error) {
    res.status(500).json({ message: "Failed to share calendar", error: error.message });
  }
};
