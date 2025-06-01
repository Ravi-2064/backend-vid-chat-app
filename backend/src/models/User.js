import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    profilePic: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    backgroundImage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    nativeLanguage: {
      type: String,
      required: [true, "Native language is required"],
    },
    learningLanguage: {
      type: String,
      required: [true, "Learning language is required"],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    hobbies: [{
      type: String,
    }],
    blogs: [{
      title: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      likes: {
        type: Number,
        default: 0,
      },
      comments: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      }],
    }],
    activityStats: {
      friendsCount: {
        type: Number,
        default: 0,
      },
      messagesCount: {
        type: Number,
        default: 0,
      },
      practiceHours: {
        type: Number,
        default: 0,
      },
    },
    interests: [{
      type: String,
    }],
    achievements: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

export default User;
