const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim: true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
    },
    description:{
        type:String,
        required:true,
        unique:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        type:String,
        require:true,
    },
    brand: {
        type:String,
        required: true,
    },
    quantity: {
        type:Number,
        required: true,
    },
    sold: {
        type:Number,
        defaul: 0, 
    },
    images: {
        type:Array,
    },
    color:{
        type:String,
        required: true,
    },
    ratings:[{
        star:Number,
        postedby:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    }],
    

}, {timestamps: true});

//Export the model
module.exports = mongoose.model('Product', productSchema);