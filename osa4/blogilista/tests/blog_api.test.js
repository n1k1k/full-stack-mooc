const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const { application } = require('express')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there is intially some blogs saved', () => {
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

  test('returned blogs have an id field', async () => {
    const response = await api.get('/api/blogs')  
    
    response.body.forEach(blog => {
      assert.strictEqual(blog.hasOwnProperty('id'), true)
    })
  })

  test('returned blogs do not have an _id field', async () => {
    const response = await api.get('/api/blogs')  
    
    response.body.forEach(blog => {
      assert.strictEqual(blog.hasOwnProperty('_id'), false)
    })
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {
      const newBlog = {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes('First class tests'))
    })

    test('if value for likes is not give, defaul is 0', async () => {
      const newBlog = {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll"
      }

      const resultBlog = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      
      assert.strictEqual(resultBlog.body.hasOwnProperty('likes'), true)
      assert.strictEqual(resultBlog.body.likes, 0)
    })

    test('fails with status code 400 if title is missing', async () => {
      const noTitleBlog = {
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 2
      }

      await api
        .post('/api/blogs')
        .send(noTitleBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with status code 400 if url is missing', async () => {
      const noUrlBlog = {
        title: "First class tests",
        author: "Robert C. Martin",
        likes: 2
      }

      await api
        .post('/api/blogs')
        .send(noUrlBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with statuscode 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api.delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(b => b.title)

      assert(!titles.includes(blogToDelete.title))

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })

    test('fails with statuscode 400 if id is not valid', async () => {
      await api.delete(`/api/blogs/fakeID`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('updating a blog', () => {
    test('succeeds with statuscode 200 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = {
        title: "Updated Title",
        author: "Updated Author",
        url: "https://updated.url",
        likes: 5
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      const blogToUpdateAtEnd = blogsAtEnd.find(b => b.id === blogToUpdate.id)

      assert.strictEqual(blogToUpdateAtEnd.title, updatedBlog.title)
      assert.strictEqual(blogToUpdateAtEnd.author, updatedBlog.author)
      assert.strictEqual(blogToUpdateAtEnd.url, updatedBlog.url)
      assert.strictEqual(blogToUpdateAtEnd.likes, updatedBlog.likes)
    })

    test('fails with statuscode 400 if id is not valid', async () => {
      const updatedBlog = {
        title: "Updated Title",
        author: "Updated Author",
        url: "https://updated.url",
        likes: 2
      }

      await api
        .put(`/api/blogs/fakeID`)
        .send(updatedBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(b => b.title)

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
      assert(titles.includes("Updated Title") === false)
    })

    test('fails with statuscode 400 if title is missing', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = {
        author: "Updated Author",
        url: "https://updated.url",
        likes: 22
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      const blogToUpdateAtEnd = blogsAtEnd.find(b => b.id === blogToUpdate.id)

      assert.strictEqual(blogToUpdateAtEnd.title, blogToUpdate.title)
      assert.strictEqual(blogToUpdateAtEnd.author, blogToUpdate.author)
      assert.strictEqual(blogToUpdateAtEnd.url, blogToUpdate.url)
      assert.strictEqual(blogToUpdateAtEnd.likes, blogToUpdate.likes)
    })

    test('fails with statuscode 400 if url is missing', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = {
        author: "Updated Author",
        title: "Updated Title",
        likes: 22
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      const blogToUpdateAtEnd = blogsAtEnd.find(b => b.id === blogToUpdate.id)

      assert.strictEqual(blogToUpdateAtEnd.title, blogToUpdate.title)
      assert.strictEqual(blogToUpdateAtEnd.author, blogToUpdate.author)
      assert.strictEqual(blogToUpdateAtEnd.url, blogToUpdate.url)
      assert.strictEqual(blogToUpdateAtEnd.likes, blogToUpdate.likes)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})