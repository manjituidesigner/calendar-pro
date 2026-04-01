import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rights: { 
    type: String, 
    enum: ['view', 'edit', 'share', 'all'], 
    default: 'view' 
  }
});

const calendarSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Personal' },
  description: { type: String },
  pin: { type: String },
  isPrivate: { type: Boolean, default: true },
  permissions: [permissionSchema]
}, {
  timestamps: true
});

const Calendar = mongoose.models.Calendar || mongoose.model('Calendar', calendarSchema);
export default Calendar;
