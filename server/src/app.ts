import express,{Response,Request} from 'express';
import cores from 'cors';
import {rateLimit} from 'express-rate-limit';
import cookieParser from 'cookie-parser';
const app=express();
app.use(
    cores({
        origin:process.env.ORIGIN,
        credentials:true
    })
)
const limiter=rateLimit({
    windowMs:15*60*1000,
    max:5000,
    standardHeaders:true,
    legacyHeaders:false,
    keyGenerator:(req:Request)=>{
        return req.ip || 'unknown'
    },
    handler:(req:Request,res:Response)=>{
        res.status(429).send('Too many requests, please try again later')
    }
})

app.use(limiter)
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'}));
app.use(express.static('public'));
app.use(cookieParser());

import dashboardRoutes from './routes/dashboardRoutes';
import authRoutes from './routes/authRoutes';
import { JwtVerify } from './middleware/auth.middleware';

app.use("/auth/",authRoutes);
app.use(JwtVerify);
app.use("/dashboard/",dashboardRoutes);

export default app;