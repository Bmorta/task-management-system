const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {getTasks,createTask,updateTask,deleteTask}=require("../controllers/taskController");
const router=express.Router();

router.use(requireAuth);
router.get("/",getTasks);
router.post("/",createTask);
router.patch("/:id",updateTask);
router.delete("/:id",deleteTask);

module.exports=router;