const e = require('express');
const User = require('../models/userModel');
const asynchHandler = require('express-async-handler');
const { generateToken } = require('../config/jwtToken');
const validateMongoDbId = require('../utils/validateMongoDbId');
const { generateRefreshToken } = require('../config/refreshtoken');
const { JsonWebTokenError } = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const { validate } = require('../models/productModel');
const createUser = asynchHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });

    if (!findUser) {
        // Create a new user
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        throw new Error('User Already Exists');
    }
});

// login a user

const loginUserController = asynchHandler(async (req, res) => {
    const { email, password } = req.body;
    //check if user exists or not
    const findUser = await User.findOne({email});
    if (findUser && (await findUser.isPasswordMatched(password))){   
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateuser = await User.findByIdAndUpdate(findUser.id, {
            refreshToken: refreshToken,
        },
        {
            new: true
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72*60*60*1000,
        });
        res.json({
            _id: findUser?._id,
            firstname:findUser?.firstname,
            lastname:findUser?.lastname,
            email: findUser?.email,
            mobile:findUser?.mobile,
            token:generateToken(findUser?._id),

        });

    } else{
        throw new Error("Invalid Credentials");
    }


});
// handle refresh token

const handleRefreshToken = asynchHandler(async(req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);
    const user = await User.findOne({
        refreshToken
    });
    if(!user) throw new Error('No Refresh token present in db or not matched');
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if(err || user.id !== decoded.id){
            throw new Error("There is something wrong with refresh token");
        }
        const accessToken = generateToken(user?._id)
        res.json({accessToken});
    })

});

//logout functionality

const logout = asynchHandler(async(req,res)=>{
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user){
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204); // forbidden
    }
    await User.findOneAndUpdate({ refreshToken: refreshToken }, {
        refreshToken: "",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });
    res.sendStatus(204);
})

// Update a user

const updateaUser = asynchHandler(async (req,res) => {
    console.log();
    const {_id} = req.user;
    validateMongDbId(_id);
    try{

        const updateUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
    },{
        new: true,
    });
    res.json(updateUser);
}      
     catch(error){
        throw new Error(error)
    }
});

//Get all users

const getallUser = asynchHandler(async (req,res) => {
    try{
        const getUsers = await User.find();
        res.json(getUsers);
    }
    catch(error){
        throw new Error(error)
    }
})

//Get a single users

const getaUser = asynchHandler(async (req,res) => {
    const{id} = req.params;
    validateMongoDbId(id);
    try{
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        })

    } catch(error){
        throw new Error(error);
    }
});

// Delete a user
const deleteaUser = asynchHandler(async (req,res) => {
    const{id} = req.params;
    validateMongoDbId(id);
    try{
        const getaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        })

    } catch(error){
        throw new Error(error);
    }
});


// Block user 
const blockUser = asynchHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const blockusr = await User.findByIdAndUpdate(
            id ,{
            isBlocked: true,
        },
        {
            new: true,
        }
    );
        res.json({
            message: "User Blocked",
        })
        
    } catch (error){
        throw new Error(error);

    }
});


// Unblock user
const unblockUser = asynchHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const unblock =  await User.findByIdAndUpdate(
            id ,{
            isBlocked: false,
        },
        {
            new: false,
        }
    );
        res.json({
            message: "User Unblocked",
        });
    } catch (error){
        throw new Error(error);
    };

    });

// Update password

const updatePassword = asynchHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
      user.password = password;
      const updatedPassword = await user.save();
      res.json(updatedPassword);
    } else {
      res.json(user);
    }
  });

  // Forgor Password
const forgotPasswordToken = asynchHandler(async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if (!user) throw new Error ("User not found with this email");
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow this link to reset your password. This link is valid till 10 minutes from now. <a href='http://localhost:5001/api/user/reset-password/${token}'>Click here</>`;
        const data = {
            to: email,
            text: "Hey User",
            subject: "Forgot Password Link",
            htm: resetURL,
        };
        sendEmail(data);
        res.json(token);
    }
    catch (error) {
        throw new Error(error);
    }
});

module.exports = { createUser, loginUserController, getallUser, getaUser, deleteaUser, updateaUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken};
