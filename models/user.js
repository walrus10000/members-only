const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: String,
  registration_date: { type: Date, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  member: { type: Boolean, required: true },
});

module.exports = mongoose.model("User", UserSchema);
