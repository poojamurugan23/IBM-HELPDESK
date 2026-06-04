const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ["General", "Technical", "Billing", "Account", "Software", "Hardware"],
            default: "General",
        },
        tags: [String],
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

// Text index for search
articleSchema.index({ title: "text", content: "text", tags: "text" });

module.exports = mongoose.model("Article", articleSchema);
