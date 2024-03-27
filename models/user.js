const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true, minLength: 1, maxLength: 30 },
  last_name: { type: String, required: true, minLength: 1, maxLength: 30 },
  username: { type: String, required: true, minLength: 1, maxLength: 30 },
  password: { type: String, required: true, minLength: 10 },
  membership: { type: Boolean, require: true },
  admin: { type: Boolean, require: true },
});

UserSchema.virtual("full_name").get(function () {
  return `${this.first_name} ${this.last_name}`;
});

module.exports = mongoose.model("User", UserSchema);
