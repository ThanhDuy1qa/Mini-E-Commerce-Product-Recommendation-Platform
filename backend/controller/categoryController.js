const Category = require('../models/Category');


// GET ALL
const getCategories = async(req,res)=>{

    const categories = await Category.find();

    res.json(categories);

};


// CREATE
const createCategory = async(req,res)=>{

    const category = await Category.create(req.body);

    res.status(201).json(category);

};


// UPDATE
const updateCategory = async(req,res)=>{

    const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new:true
        }
    );

    res.json(category);

};


// DELETE
const deleteCategory = async(req,res)=>{

    await Category.findByIdAndDelete(req.params.id);

    res.json({
        message:"Category deleted"
    });

};


module.exports={
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};