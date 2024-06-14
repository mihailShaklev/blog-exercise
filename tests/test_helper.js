const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'dating for dummies',
        author: 'pesho',
        url: 'www.blog1.com',
        likes: 2
    },
    {
        title: 'node.js for dummies',
        author: 'misho',
        url: 'www.blog2.com',
        likes: 4
    },
    {
        title: 'advanced Python',
        author: 'gogo',
        url: 'www.blog3.com',
        likes: 12
    }
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
  }

module.exports = {initialBlogs, blogsInDb, usersInDb}