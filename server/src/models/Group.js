import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["expense_created", "expense_updated", "expense_deleted", "expense_settled", "member_added", "member_removed", "group_updated"],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    expenseTitle: String,
    amount: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    activities: [activitySchema]
  },
  { timestamps: true }
);

export const Group = mongoose.model("Group", groupSchema);
