const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const validRoles = {
	values: [ 'ADMIN_ROLE', 'USER_ROLE' ],
	message: '{VALUE} invalid role'
};

const userSchema = new Schema({
	name: {
		type: String,
		required: [ true]
	},
	email: {
		type: String,
		unique: true,
		required: [ true ]
	},
	pass: {
		type: String,
		required: [ true ]
	},
	img: {
		type: String,
		required: [ false ]
	},
	role: {
		type: String,
		required: [ true ],
		default: 'USER_ROLE',
		enum: validRoles
	},
	google: {
		type: Boolean,
		required: true,
		default: false
	}
});

userSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' });

module.exports = mongoose.model('User', userSchema);
