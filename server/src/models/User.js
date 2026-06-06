import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * UserSchema — defines the shape of a user document in MongoDB.
 *
 * Design decisions:
 * - email is lowercase + trimmed so "User@Example.com" and "user@example.com"
 *   are treated as the same address at the DB level.
 * - password is never returned in queries by default (select: false).
 *   You must explicitly opt in with .select("+password") when you need it.
 * - avatar is optional and defaults to an empty string. Phase 5 will wire
 *   this to an upload service.
 * - timestamps: true automatically adds createdAt and updatedAt fields.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never returned in queries unless explicitly requested
    },

    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Pre-save hook — hashes the password before writing to MongoDB.
 *
 * Only runs when the password field is new or modified.
 * Salt rounds = 12 gives a good security/performance balance.
 * (10 is common; 12 is slightly more secure and still fast enough.)
 */
userSchema.pre("save", async function (next) {
  // Skip hashing if password hasn't changed (e.g. updating name/avatar)
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * matchPassword — instance method to compare a plain-text password
 * against the stored hash.
 *
 * Usage: const isMatch = await user.matchPassword(plainTextPassword)
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * toJSON override — removes __v from every JSON response automatically.
 * The password is already hidden via select:false so we don't need to
 * delete it here.
 */
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;