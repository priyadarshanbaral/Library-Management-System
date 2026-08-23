import mongoose from "mongoose";


let studentsSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    dob:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true 
    },
    regd_no:{
        type:Number,
        required:true

    },
    password:{
      type:String,
      required:true
    },

    issue:{
        type:Array,
        required:true
    },
    submit:{
        type:Array,
        required:true
    }
})


export default  mongoose.model('students',studentsSchema)