import { Group } from "../models/Group.js";
import { User } from "../models/User.js";
import { Expense } from "../models/Expense.js";
import { ApiError } from "../utils/ApiError.js";

export const populateGroup = (query) =>
  query
    .populate("createdBy", "name email avatarInitials avatarColor")
    .populate("members", "name email avatarInitials avatarColor")
    .populate("activities.actor", "name email avatarInitials avatarColor");

export const isGroupMember = (group, userId) =>
  group.members.some((member) => member._id ? member._id.equals(userId) : member.equals(userId));

export const getGroupForMember = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found", "GROUP_NOT_FOUND");
  if (!isGroupMember(group, userId)) {
    throw new ApiError(403, "You do not have access to this group", "GROUP_FORBIDDEN");
  }
  return group;
};

export const addActivity = async (groupId, activity) => {
  await Group.findByIdAndUpdate(groupId, {
    $push: {
      activities: {
        $each: [activity],
        $position: 0,
        $slice: 30
      }
    }
  });
};

export const createGroup = async ({ name, description }, userId) => {
  const group = await Group.create({
    name,
    description,
    createdBy: userId,
    members: [userId]
  });
  return populateGroup(Group.findById(group._id));
};

export const updateGroup = async (groupId, payload, userId) => {
  const group = await getGroupForMember(groupId, userId);
  group.name = payload.name ?? group.name;
  group.description = payload.description ?? group.description;
  group.activities.unshift({
    action: "group_updated",
    message: "Group details updated",
    actor: userId
  });
  group.activities = group.activities.slice(0, 30);
  await group.save();
  return populateGroup(Group.findById(group._id));
};

export const deleteGroup = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found", "GROUP_NOT_FOUND");
  if (!group.createdBy.equals(userId)) {
    throw new ApiError(403, "Only the group creator can delete this group", "GROUP_DELETE_FORBIDDEN");
  }
  await Expense.deleteMany({ group: groupId });
  await group.deleteOne();
};

export const updateMembers = async (groupId, payload, userId) => {
  const group = await getGroupForMember(groupId, userId);

  if (payload.email) {
    const member = await User.findOne({ email: payload.email.toLowerCase() });
    if (!member) throw new ApiError(404, "No user exists with that email", "USER_NOT_FOUND");
    if (!isGroupMember(group, member._id)) {
      group.members.push(member._id);
      group.activities.unshift({
        action: "member_added",
        message: `${member.name} joined the group`,
        actor: userId
      });
    }
  }

  if (payload.removeUserId) {
    if (String(payload.removeUserId) === String(group.createdBy)) {
      throw new ApiError(400, "The group creator cannot be removed", "CREATOR_REMOVE_FORBIDDEN");
    }
    const before = group.members.length;
    group.members = group.members.filter((memberId) => String(memberId) !== String(payload.removeUserId));
    if (group.members.length !== before) {
      group.activities.unshift({
        action: "member_removed",
        message: "A member was removed from the group",
        actor: userId
      });
    }
  }

  group.activities = group.activities.slice(0, 30);
  await group.save();
  return populateGroup(Group.findById(group._id));
};
