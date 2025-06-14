import mongoose from 'mongoose';

const MiscExpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  entries: [
    {
      date: { type: Date, default: Date.now },
      data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    }
  ],
  totalMiscExp: { type: Number, default: 0 }
});

const MiscExp = mongoose.model('MiscExp', MiscExpSchema);
export default MiscExp;
