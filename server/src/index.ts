import "dotenv/config";
import app from './app';
import dotevn from 'dotenv';
dotevn.config({
    path:"./.env"
});
const PORT=process.env.PORT || 7000;
app.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
});

