
import { Request, Response } from 'express';
import { registerValidation } from '../validation/authValidation';
import { ZodError } from 'zod';
import { formatZodError } from '../validation/helpers';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { sendEmail } from '../config/mail';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (email: string) => {
        try {
          const user = await prisma.user.findFirst({ where: { email } });
      
        //   const accessToken = user.generateAccessToken();
        //   const refreshToken = user.generateRefreshToken();
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new Error("ACCESS_TOKEN_SECRET is not defined");
        }
        const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '50m' });
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new Error("REFRESH_TOKEN_SECRET is not defined");
        }
        const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
          return { accessToken, refreshToken };
        } catch (error) {

        }
      };
const RegisterRoute = async (req: Request, res: Response): Promise<any> => {
try {
        const body=await req.body;
        const {name,email,password,role}=body;
        const validatedUser=registerValidation.parse(body);
        if(validatedUser.role==="PARENT" && !validatedUser.studentEmail){
            return res.status(422).json({message:"Student Email Required"});
        }
        let userExist=await prisma.user.findFirst({where:{email: validatedUser.email}});
        if(userExist){
                // return res.status(409).json({message:"User Already Exist"});
            return res.status(409).json({errors:{email:"User Already Exist"}});
        }

        const otp=Math.floor(100000 + Math.random() * 900000);  
        const hashedPassword=await bcrypt.hash(validatedUser.password,10);
        const newUser=await prisma.user.create({data:{email: validatedUser.email, password: hashedPassword, role:role,name:validatedUser?.name,otp:otp,isVerified:false,studentEmail:validatedUser?.studentEmail}});
        //send email otp
        // console.log(newUser); 
        await sendEmail(newUser.email, "OTP Verification", `Your OTP is ${otp} and it will expire in 30 minutes so please verify your email as soon as possible to activate your account`);
        return res.status(201).json({message:"User Registered Successfully. Please Verify Your Email"});
        
} catch (error) {
        if(error instanceof ZodError){
                // console.log(error);
                const errors=formatZodError(error);
                return res.status(422).json({message:"All data Requried",errors});
        }
        return res.status(500).json({message:"Something went wrong",error}); 
    }
}
const EmailVarificationRoute = async (req: Request, res: Response):Promise<any>  => {
        try {
            const {email,otp}=req.body;
            const user=await prisma.user.findFirst({where:{email}});
            if(!user){
                return res.status(404).json({message:"User Not Found"});
            }
        
            if(user.otp!==otp){
                return res.status(400).json({message:"Invalid OTP"});
            }
            if(user.isVerified){
                return res.status(400).json({message:"Email Already Varified"});
            }
            if(user.otpExpiry && new Date().getTime() - new Date(user.otpExpiry).getTime() > 30 * 60 * 1000){
                return res.status(400).json({message:"OTP Expired"});
            }
            await prisma.user.update({where:{id:user.id},data:{isVerified:true}});
            return res.status(200).json({message:"Email Varified Successfully"});
        } catch (error) {
            return res.status(500).json({message:"Something went wrong",error});
        }
}
const LoginRoute = async (req: Request, res: Response):Promise<any>  => {
        try {
            const {email,password}=req.body;
            const user=await prisma.user.findFirst({where:{email}});
            if(!user){
                return res.status(404).json({message:"User Not Found"});
            }
            if(!user.isVerified){
                return res.status(400).json({message:"Email Not Varified"});
            }
            const isPasswordValid=await bcrypt.compare(password,user.password);
            if(!isPasswordValid){
                return res.status(400).json({message:"Invalid Password"});
            }
            const tokens = await generateAccessAndRefreshTokens(user.email);
            if (!tokens) {
                return res.status(500).json({ message: "Failed to generate tokens" });
            }
            const loginUser=await prisma.user.update({where:{id:user.id},data:{refreshToken:tokens.refreshToken}});
            const { accessToken, refreshToken } = tokens;
            const options = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
              };
              return res.cookie("accessToken", accessToken,options).cookie("refreshToken", refreshToken,options).status(200).json({message:"Login Successfully",accessToken,refreshToken,});
             
        } catch (error) {
            return res.status(500).json({message:"Something went wrong",error});
        }
}
const ForgotPasswordRoute = async (req: Request, res: Response):Promise<any>  => {
        try {
            const {email}=req.body;
            const user=await prisma.user.findFirst({where:{email}});
            if(!user){
                return res.status(404).json({message:"User Not Found"});
            }
            const otp=Math.floor(100000 + Math.random() * 900000);  
            await prisma.user.update({where:{id:user.id},data:{otp}});
            await sendEmail(user.email, "OTP Verification", `Your OTP is ${otp} and it will expire in 30 minutes so please reset your password as soon as possible`);
            return res.status(200).json({message:"OTP Sent Successfully"});
        } catch (error) {
            return res.status(500).json({message:"Something went wrong",error});
        }
}
const ResetPasswordRoute = async (req: Request, res: Response):Promise<any>  => {
        try {
            const {email,otp,password}=req.body;
            const user=await prisma.user.findFirst({where:{email}});
            if(!user){
                return res.status(404).json({message:"User Not Found"});
            }
            if(user.otp!==otp){
                return res.status(400).json({message:"Invalid OTP"});
            }
            if(user.otpExpiry && new Date().getTime() - new Date(user.otpExpiry).getTime() > 30 * 60 * 1000){
                return res.status(400).json({message:"OTP Expired"});
            }
            const hashedPassword=await bcrypt.hash(password,10);
            await prisma.user.update({where:{id:user.id},data:{password:hashedPassword}});
            return res.status(200).json({message:"Password Reset Successfully"});
        } catch (error) {
            return res.status(500).json({message:"Something went wrong",error});
        }
}
const LogoutRoute = async (req: Request, res: Response):Promise<any>  => {
        try {
            const user=await prisma.user.findFirst({where:{email:req.body.email}});
            if(!user){
                return res.status(404).json({message:"User Not Found"});
            }
            await prisma.user.update({where:{id:user.id},data:{refreshToken:null}});
            return res.status(200).json({message:"Logout Successfully"});
        } catch (error) {
            return res.status(500).json({message:"Something went wrong",error});
        }
}

export { RegisterRoute, LoginRoute, EmailVarificationRoute, ForgotPasswordRoute, ResetPasswordRoute, LogoutRoute };
