import { title } from "process";
import z from "zod";

export const registerValidation = z.object({
    name: z.string({message: "Name is required"}),
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(5,{message: "Password must be at least 5 characters long"}),
    role: z.enum(["STUDENT", "SCHOOL", "PARENT"],{message: "Invalid Role"}),
    studentEmail: z.string().email().optional(),
})

export const loginValidation = z.object({
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(5,{message: "Password must be at least 5 characters long"}),
})

export const emailVerificationValidation = z.object({
    email: z.string().email({message: "Invalid email address"}),
    otp: z.string().length(6,{message: "Invalid OTP"}),
})

export const addAchievementValidation = z.object({
    title: z.string({message: "Title is required"}),
    description: z.string({message: "Description is required"}),    


})
