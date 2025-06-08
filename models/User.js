const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
username: {
type: String,
required: [true, 'Username is required'],
unique: true,
minlength: [3, 'Username must be at least 3 characters long'],
maxlength: [30, 'Username cannot exceed 30 characters']
},
email: {
type: String,
required: [true, 'Email is required'],
unique: true,
match: [/.+@.+..+/, 'Please enter a valid email address']
},
password: {
type: String,
required: [true, 'Password is required'],
minlength: [6, 'Password must be at least 6 characters long']
},
profilePicture: {
type: String,
default: 'https://via.placeholder.com/150'
},
role: {
type: String,
enum: ['user', 'admin'],
default: 'user'
},
bio: {
type: String,
default: ''
},
country: {
type: String,
default: ''
},
lastLogin: {
type: Date,
default: null
},
solvedProblems: [{
type: mongoose.Schema.Types.ObjectId,
ref: 'Problem'
}],
submissions: [{
type: mongoose.Schema.Types.ObjectId,
ref: 'Submission'
}],
bookmarkedProblems: [{
type: mongoose.Schema.Types.ObjectId,
ref: 'Problem'
}]
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
if (!this.isModified('password')) return next();
try {
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);
next();
} catch (err) {
next(err);
}
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
