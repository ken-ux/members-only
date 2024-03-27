const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true, maxLength: 30 },
  text: { type: String, required: true, maxLength: 30 },
  timestamp: { type: Date, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

MessageSchema.virtual("timestamp_formatted").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString();
});

module.exports = mongoose.model("Message", MessageSchema);
