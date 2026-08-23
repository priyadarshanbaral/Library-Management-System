import mongoose from "mongoose";

const allBooksSchema = new mongoose.Schema(
  {
    photo: {
      data: {
        type: Buffer,
        required: true,
      },
      contentType: {
        type: String,
        required: true,
      },
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    pages: [
      {
        data: {
          type: Buffer,
        },
        contentType: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("allbooks", allBooksSchema);