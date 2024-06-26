const crypto = require('crypto');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Enter your name here!']
    },
    email:{
        type:String, 
        required:[true, 'Enter your email!'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail, ' Please provide a valid email']
    },
    photo:String,
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'Please Provide a password'],
        minlength: 8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,'Please confirm your password'],
        validate:{
            //this only works on create and save!!
            validator: function(el){
                return el === this.password;
            },
            message: 'Password does not match'
        },

    },
    passwordChangedAt:Date,
    PasswordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false,
    }
});


userSchema.pre('save',async function(next){
    //only run function if password was modifed
    if(!this.isModified('password')) return next();

    //Hash the passowrd with the cost of 12
    this.password  = await bcrypt.hash(this.password, 12);
    
    //delete teh confirm passowrd 
    this.passwordConfirm = undefined;
    next();

});
userSchema.pre('save',function(next){
    if(!this.isModified('password')||this.isNew)return next();

    this.passwordChangedAt = Date.now()-1000;
    next();
});

userSchema.pre(/^find/,function(next){
    //this points to current query
    this.find({active:{$ne:false}});
    next();

});


userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changedPasswordAfter= function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp  = parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTTimestamp < changedTimestamp; 
    }
    //False means not changed
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.PasswordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken},this.PasswordResetToken);

    this.passwordResetExpires = Date.now()+ 10*60*1000;

    return resetToken;
};


const User = mongoose.model('User',userSchema);

module.exports = User;
