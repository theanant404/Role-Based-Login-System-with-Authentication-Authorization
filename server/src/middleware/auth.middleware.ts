import {Request,Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/database";
// jwt verification
import { User } from "@prisma/client";
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
export const JwtVerify=async(req:Request,res:Response,next:NextFunction):Promise<any>=>{
    const token=req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","");
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    try {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) {
            return res.status(500).json({ message: "Internal server error: missing token secret" });
        }
        const decodedToken = jwt.verify(token, secret) as jwt.JwtPayload;
        const user = await prisma.user.findFirst({ where: { email: decodedToken.email } });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({message:"Something went wrong",error});
        
    }
}
export const getLoggedInUser=async(req:Request,res:Response,next:NextFunction):Promise<any>=>{
    const token=req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","");
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as jwt.JwtPayload;
        const user = await prisma.user.findFirst({ where: { email: decodedToken.email } });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        next();
    } catch (error) {
        next()
        return res.status(500).json({message:"Something went wrong",error});
    }
}

export const verifyPermission=(role:string)=>{
    return async(req:Request,res:Response,next:NextFunction):Promise<any>=>{
        if(!req.user?.email){
            return res.status(401).json({message:"Unauthorized"});
        }
        if(role.includes(req.user.role)){
            next();
        }else{
            return res.status(401).json({message:"Unauthorized"});
        }
    }
}