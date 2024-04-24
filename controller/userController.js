const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj,...allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj [el] = obj[el];
    });
    return newObj;
}

exports.getAllUsers = catchAsync(async(req,res,next)=>{
        const users = await User.find();

        res.status(200).json({
            status:'success',
            results: users.length,
            data:{
                users
            }
        });
});

exports.updateMe = catchAsync(async(req,res,next)=>{
    //1) create err if user posts password data
    if(req.body.password||req.body.passwordConfirm){
        return next(
            new AppError(
                'This route is not for updating password',
                400
            )
            );
    }

    //filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name','email');
    //2)update the user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        status:'success',
        data:{
            user:updatedUser
        }
    });
}); 


exports.deleteMe = catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false});
    console.log(user);
    res.status(204).json({
        status:'success',
        data:null
    })
})

exports.createUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not ywt defined'
    });
};
exports.getUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not ywt defined'
    });
};
exports.updateUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not ywt defined'
    });
};
exports.deleteUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    });
};