import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{11}$/.test(v);
        },
        message: (props) => `Phone number must be exactly 11 digits`,
      },
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    itemsSupplied: {
      type: [String],
      required: false,
      default: [],
    },
    rating: {
      type: String,
      enum: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
      default: "5 Stars",
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;
