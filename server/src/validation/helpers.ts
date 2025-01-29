import { ZodError } from "zod";
export const formatZodError = (error: ZodError) => {
    let errors:any={}
    error.errors.map((err)=>{
        errors[err.path?.[0]]=err.message;
    })
    return errors;
}