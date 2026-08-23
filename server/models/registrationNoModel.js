import mongoose from "mongoose";

let redgNoSchema = new mongoose.Schema({
    registration_no: {
        type: Number,
        required: true,
        default: 1001,
    },
});

let redgNo = mongoose.model("registration_no", redgNoSchema);

// Initialize registration number document if it doesn't exist
export const initRegistrationNo = async () => {
    try {
        const existing = await redgNo.findOne();

        if (!existing) {
            await redgNo.create({ registration_no: 1001 });
            console.log("Registration number initialized to 1001");
        }
    } catch (err) {
        console.error("Registration number init error:", err.message);
    }
};

export default redgNo;

