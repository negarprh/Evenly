import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

const avatarColors = ["#2563eb", "#0f766e", "#c2410c", "#7c3aed", "#be123c", "#047857"];

const initialsFor = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const signToken = (userId) =>
  jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

export const signup = async ({ name, email, password }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists", "EMAIL_IN_USE");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    avatarInitials: initialsFor(name),
    avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)]
  });

  return { user, token: signToken(user._id) };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return { user, token: signToken(user._id) };
};

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export const updateProfile = async (userId, { name, password }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  if (name) {
    user.name = name.trim();
    user.avatarInitials = initialsFor(user.name);
  }

  if (password) {
    user.passwordHash = await bcrypt.hash(password, 12);
  }

  await user.save();
  return user;
};
