const { test, after, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
    await Blog.deleteMany({})
  
    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)

})


test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
})


test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})


test('field id is named id', async () => {
    const response = await api.get('/api/blogs')

    assert.equal(Object.keys(response.body[0]).includes('id'), true)
})


test('a valid blog can be added', async () => {
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


test('detect missing title or url', async () =>{
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


test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const contents = blogsAtEnd.map(r => r.title)
    assert(!contents.includes(blogToDelete.title))
})


test('a valid blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    blogToUpdate.likes = 20

    await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(blogToUpdate)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

    assert.deepStrictEqual(blogToUpdate, blogsAtEnd[0])
})


describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creation of user with password less than 3 characters fails', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'papi',
        name: 'papi',
        password: 'sa',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect({"error":"password must be at least 3 characters long"})
  
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  
      const usernames = usersAtEnd.map(u => u.username)
      assert(!usernames.includes(newUser.username))

    })

    test('creation of user with username less than 3 characters fails', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'pa',
        name: 'papi',
        password: 'satti',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
  
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  
      const usernames = usersAtEnd.map(u => u.username)
      assert(!usernames.includes(newUser.username))

    })

    test('creation of user without username fails', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: '',
        name: 'papi',
        password: 'satti',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
  
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  
      const usernames = usersAtEnd.map(u => u.username)
      assert(!usernames.includes(newUser.username))

    })

    test('creation of user without password fails', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'papi',
        name: 'papi',
        password: '',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
  
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  
      const usernames = usersAtEnd.map(u => u.username)
      assert(!usernames.includes(newUser.username))

    })
  })


after(async () => {
    await mongoose.connection.close()
})