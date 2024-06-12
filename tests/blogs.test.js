const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')

const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
  
    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})


test.only('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
})


test.only('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})


test.only('field id is named id', async () => {
    const response = await api.get('/api/blogs')

    assert.equal(Object.keys(response.body[0]).includes('id'), true)
})


test.only('a valid blog can be added', async () => {
    const newBlog = {
        title: 'async and await are awesome',
        author: 'mixxo',
        url: 'www.awesome-await.com',
        likes: 54
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const blogTitles = blogsAtEnd.map(blog => blog.title)
    assert(blogTitles.includes('async and await are awesome'))
})


test.only('detect missing title or url', async () =>{
    const newBlog = {
        title: '',
        author: 'mixxo',
        url: '',
        likes: 54
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

})


after(async () => {
    await mongoose.connection.close()
})