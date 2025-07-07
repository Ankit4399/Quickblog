import fs from 'fs';
import imageKit from '../configs/imageKit.js';
import Blog from '../models/Blog.model.js';
import Comment from '../models/comment.model.js';


export const addBlog = async (req, res) => {
    try {
        const {title,subTitle,description,category,isPublished} =JSON.parse(req.body.blog);
        const imageFile = req.file;

        if(!title || !description || !category || !imageFile) {
            return res.status(400).json({message: "All fields are required"});
        }

        const fileBuffer = fs.readFileSync(imageFile.path);

        // Upload image to ImageKit
        const response = await imageKit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/blogs"
        });

        //optimisation through imageKit URL transformation
        const optimisedImageUrl = imageKit.url({
            path: response.filePath,
            transformation: [{
                quality: "auto", //auto compression
                format: "webp", //convert to modern format
                width: "1280"  //width resizing
            }]
        });

        const image = optimisedImageUrl;

        await Blog.create({
            title,
            subTitle,
            description,
            category,
            image,
            isPublished
        });
        res.status(201).json({message: "Blog added successfully"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({isPublished: true});
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getBlogById = async (req, res) => {
    try {
        const {blogId} = req.params;
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({message: "Blog not found"});
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const deleteBlogById = async (req, res) => {
    try {
        const {id} = req.body;
        const blog = await Blog.findByIdAndDelete(id);
        if (!blog) {
            return res.status(404).json({message: "Blog not found"});
        }
        res.status(200).json({message: "Blog deleted successfully"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const togglePublish = async (req, res) => {
    try {
        const {id} = req.body;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({message: "Blog not found"});
        }
        blog.isPublished = !blog.isPublished;
        await blog.save();
        res.status(200).json({message: `Blog ${blog.isPublished ? 'published' : 'unpublished'} successfully`});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const addComment = async (req, res) => {
    try {
        const{blog,name,content} = req.body;
        await Comment.create({blog,name,content});
        res.status(201).json({message: "Comment added successfully"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getBlogComments = async (req, res) => {
    try {
        const {blogId} = req.body;
        const comments = await Comment.find({blog: blogId, isApproved: true}).sort({createdAt: -1});
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}