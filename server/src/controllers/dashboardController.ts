import { Request,Response } from "express";
import prisma from "../config/database";
import { addAchievementValidation } from "../validation/authValidation";
import { ZodError } from "zod";
import { formatZodError } from "../validation/helpers";

const DashboardRoute = async (req: Request, res: Response):Promise<any>  => {
    try {
        const useremail= req.user?.email;
        if(!useremail){
            return res.status(401).json({message:"User Not Found"});
        }
        const user=await prisma.user.findFirst({where:{email: useremail}});
        if(!user){
            return res.status(404).json({message:"User Not Found"});
        }
        if(user.role==="STUDENT"){
            const Achievement=await prisma.studentAchievement.findMany({where:{studentId: user.id}});
            return res.status(200).json({message:"Welcome Student",data:{email: user.email, name: user.name,id:user.id}, Achievement});
        }
        if(user.role==="SCHOOL"){
            const studentList=await prisma.user.findMany({where:{role:"STUDENT"}});
            const parentList=await prisma.user.findMany({where:{role:"PARENT"}});
            return res.status(200).json({message:"Welcome School",data:{students:studentList.map(student => ({email: student.email, name: student.name, id: student.id}))},parents:parentList.map(parent => ({email: parent.email, name: parent.name, id: parent.id, studentEmail: parent.studentEmail}))});
        }
        if(user.role==="PARENT"){
            const student=await prisma.user.findFirst({where:{studentEmail:user.email}});
            const studentData=await prisma.studentAchievement.findFirst({where:{studentId: student?.id}});
            return res.status(200).json({message:"Welcome Parent",data:{email: user.email, name: user.name, id: user.id, studentEmail: user.studentEmail}, Achievement:studentData});
        }
    } catch (error) {
        return res.status(500).json({message:"Something went wrong",error});
    }
}
const StudentDetailsRoute = async (req: Request, res: Response):Promise<any>  => {
    try {
        const user=req.user?.email;
        // console.log(user)
        if(!user){
            return res.status(401).json({message:"User Not Found"});
        }
        const School=await prisma.user.findFirst({where:{email:user}});
        if(!School){
            return res.status(404).json({message:"School Not Found"});
        }
        if(School.role!=="SCHOOL"){
            return res.status(401).json({message:"Access Denied"});
        }
        const {id}=req.params;
        // console.log("id",id)
        const student=await prisma.user.findFirst({where:{id: Number(id)}});
        const studentData=await prisma.studentAchievement.findMany({where:{studentId: Number(id)}});
        return res.status(200).json({message:"Student Details",data:{email: student?.email, name: student?.name, id: student?.id}, Achievement:studentData});
    } catch (error) {
        return res.status(500).json({message:"Something went wrong",error});
    }
}
const AddNewAchievementRoute = async (req: Request, res: Response):Promise<any>  => {
    try {
        const user=req.user?.email;
        if(!user){
            return res.status(401).json({message:"User Not Found"});
        }
        const School=await prisma.user.findFirst({where:{email:user}});
        if(!School){
            return res.status(404).json({message:"School Not Found"});
        }
        if(School.role!=="SCHOOL"){
            return res.status(401).json({message:"Access Denied"});
        }
        
        const body=await req.body;
        const {id}=req.params;
        const achievement=addAchievementValidation.parse(body)
        const {title,description}=achievement;
        const student=await prisma.user.findFirst({where:{id: Number(id)}});
        if(!student){
            return res.status(404).json({message:"Student Not Found"});
        }
        await prisma.studentAchievement.create({data:{title, description, studentId: student.id, SchoolId: School.id}});
        return res.status(200).json({message:"Achievement Added Successfully"});
    } catch (error) {
        if(error instanceof ZodError){
                        // console.log(error);
                        const errors=formatZodError(error);
                        return res.status(422).json({message:"All data Requried",errors});
        }
        return res.status(500).json({message:"Something went wrong",error});
    }
}
const AddStudentAchievementRoute = async (req: Request, res: Response):Promise<any>  => {
    try {
        const user=req.user?.email;
        if(!user){
            return res.status(401).json({message:"User Not Found"});
        }
        const School=await prisma.user.findFirst({where:{email:user}});
        if(!School){
            return res.status(404).json({message:"School Not Found"});
        }
        if(School.role!=="SCHOOL"){
            return res.status(401).json({message:"Access Denied"});
        }
        const {id}=req.params;
        const {title,description}=req.body;
        const studentData=await prisma.studentAchievement.findFirst({where:{studentId: Number(id)}});
        if(!studentData){
            return res.status(404).json({message:"Student Not Found"});
        }
        await prisma.studentAchievement.create({data:{studentId:Number(id), SchoolId:School.id, title, description}});
        return res.status(200).json({message:"Achievement Added Successfully"});
    } catch (error) {
        return res.status(500).json({message:"Something went wrong",error});
    }
}
const RemoveStudentAchivementRoute= async (req: Request, res: Response):Promise<any>  => {
    try {
        const user=req.user?.email;
        if(!user){
            return res.status(401).json({message:"User Not Found"});
        }
        const School=await prisma.user.findFirst({where:{email:user}});
        if(!School){
            return res.status(404).json({message:"School Not Found"});
        }
        if(School.role!=="SCHOOL"){
            return res.status(401).json({message:"Access Denied"});
        }
        const {id}=req.params;
        const {achievementId}=await req.body;
        // console.log(achievementId)
        if(!achievementId){
            return res.status(404).json({message:"Achievement Id Required"});
        }
        // console.log(achievementId)
        const student=await prisma.user.findFirst({where:{id: Number(id)}});
        if (!student) {
            return res.status(404).json({message:"Student Not Found"});
        }
        const studentData=await prisma.studentAchievement.findMany({where:{id: Number(student.id)}});
        console.log(studentData)
        if(!studentData){
            return res.status(404).json({message:"Student Not Found"});
        }
        await prisma.studentAchievement.delete({where:{id:Number(achievementId)}});
        return res.status(200).json({message:"Achievement Removed Successfully"});
    } catch (error) {
        return res.status(500).json({message:"Something went wrong",error});
    }
}
const deleteUser= async (req: Request, res: Response):Promise<any>  => {
    try {
        const user=req.user?.email;
        if(!user){
            return res.status(401).json({message:"User Not Found"});
        }
        const School=await prisma.user.findFirst({where:{email:user}});
        if(!School){
            return res.status(404).json({message:"School Not Found"});
        }
        if(School.role!=="SCHOOL"){
            return res.status(401).json({message:"Access Denied"});
        }
        const {id}=req.params;
        const User=await prisma.user.findFirst({where:{id: Number(id)}});
        
        if(!User){
            return res.status(404).json({message:"User Not Found"});
        }
        if( User.role==="SCHOOL"){
            return res.status(400).json({message:"School Can't be Deleted"});
        }
        await prisma.user.delete({where:{id:Number(id)}});
        return res.status(200).json({message:"User Removed Successfully"});
    } catch (error) {
        return res.status(500).json({message:"Something went wrong",error});
    }

}

export {DashboardRoute,StudentDetailsRoute,AddNewAchievementRoute,AddStudentAchievementRoute,RemoveStudentAchivementRoute,deleteUser};