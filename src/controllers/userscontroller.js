const User = require("../models/usersmodel");
const otpmodel = require("../models/otpmodel");
const transporter = require("../middleware/emailTransporter");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//add user
exports.addUser = async (req, res) => {
    const {name, email, password} = req.body;
    try{
        const existinguser = await User.findOne({email});
        if(existinguser){
            return res.status(400).json({message: "User already exists"});
        }
        const hashpassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, 
            email, 
            password: hashpassword
        });
        res.status(201).json(user);
    }catch(err){
        res.status(500).json({message: err.message});
    }
};

//login user
exports.loginUser = async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message: "Invalid credentials"});
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
        //returning user's email and name and token as well
        res.status(200).json({email: user.email, name: user.name, token});
        
    }catch(err){
        res.status(500).json({message: err.message});
    }
};

//change password by authenticating via barear-token
exports.changePassword = async (req, res) => {
    const {oldPassword, newPassword} = req.body
    try {
        const user = await User.findById(req.user.id); 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        const hashpassword = await bcrypt.hash(newPassword, 10);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }
        user.password = hashpassword;
        await user.save();
        res.status(200).json({message: "Password changed successfully", password: user.password});
    } catch(err){
        res.status(500).json({message: err.message});
    }
};

//update userinfo
exports.updateUser = async (req, res) => {
    const {email} =req.body;
    try{
        const user = await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        user.email = email;
        await user.save();
        res.status(200).json(user);

    }catch(err){
        res.status(500).json({message: err.message});
    };
};

//get user
exports.getUser = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({message: err.message});
    };
};


// Generate a random 6-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Send OTP
exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        const newotp = await otpmodel.create({ email, otp });//create a new otp record

        // Send email using transporter
        await transporter.sendMail({
            from: "pkhassanraza9@gmail.com",
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${newotp.otp}. It is valid for 5 minutes.`,
        });

        res.status(200).json({ message: "OTP sent successfully", email , otp: newotp.otp });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpRecord = await otpmodel.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const otpRecord = await otpmodel.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        await user.save();

        // Delete OTP record after successful reset
        await otpmodel.deleteOne({ email });

        res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};