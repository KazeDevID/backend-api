const Product = require('../models/productModel');
const expressAsyncHandler = require('express-async-handler');
const asynchHandler = require("express-async-handler");
const slugify = require('slugify');
const createProduct = asynchHandler(async (req, res) => {
    try {
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
});

//update product
/*const updateProduct= asynchHandler(async (req, res) => {
    const id = req.params;
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const updateProduct = await Product.findOneAndUpdate({ id }, req.body, {
        new: true,
      });
      res.json(updateProduct);
    } catch (error) {
      throw new Error(error);
    }
  });
  */
  const updateProduct = async (req, res) => {
    const id = req.params.id; 
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const updateProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
      });
  
      if (!updateProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      res.json(updateProduct);
    } catch (error) {
        throw new Error(error);
    }
  };
  
// delete product 
const deleteProduct = async (req, res) => {
    const id = req.params.id; 
    try {
      const deleteProduct = await Product.findOneAndDelete(id);
      res.json(deleteProduct);
    } catch (error) {
        throw new Error(error);
    }
  };


// get a product
const getaProduct = asynchHandler(async(req, res) => {
    const {id} = req.params;
    try {
        
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    }
    catch (error){
        throw new Error(error);
    }
});

//get all product
const getAllProduct = asynchHandler(async(req, res) => {
    try {
        //Filtering
        const queryObj = {...req.query};
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((el)=> delete queryObj[el]);
        console.log(queryObj);
        let queryStr=JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        
        let query = Product.find (JSON.parse(queryStr));

        // Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if(req.query.page){
      const productCount = await Product.countDocuments();
      if(skip>= productCount) throw new Error('This page does not exists');
    }
    console.log(page, limit, skip);
    
        const product = await query;
        res.json(product);
        }
    catch(error){
        throw new Error(error);
    }
})
module.exports = { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct };
