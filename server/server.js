require("dotenv").config();
const express=require("express");
const cors=require("cors");
const connectDB=require("./config/db");
const taskRoutes=require("./routes/taskRoutes");

const app=express();
const PORT=process.env.PORT||5000;

app.use(cors({origin:process.env.CLIENT_URL||"http://localhost:5173"}));
app.use(express.json());

app.get("/",(req,res)=>res.json({message:"Capstone 3 Task Manager API is running"}));
app.get("/api/health",(req,res)=>res.json({status:"ok",database:"MongoDB"}));
app.use("/api/tasks",taskRoutes);

async function startServer(){
  try{
    await connectDB();
    app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
  }catch(error){
    console.error("Server startup failed:",error.message);
    process.exit(1);
  }
}
startServer();