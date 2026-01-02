import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        
        default: 'name',
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'male',
    },
    dateOfBirth: {
        type: Date,
        default: '03/14/2001',
    },
    address: {
        type: String,
        
         default: 'address',        
       
    },
    contactNumber: {
        type: String,
        default: '00000000000',
        validate: {
            validator: function(v) {
                return /^\d{11}$/.test(v);
            },
            message: props => `Phone number must be exactly 11 digits`
        }
    },
    profilePicture:{
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
    profilePicturePublicId: {
        type: String,
        default: null,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    }
}, {timestamps: true});

const User = mongoose.model('User',userSchema);

export default User;
