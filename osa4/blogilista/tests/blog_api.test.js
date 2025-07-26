const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
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

test('a valid blog can be added', async () => {
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

test('a blog without title is not added', async () => {
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

test('a blog without url is not added', async () => {
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
  
  

after(async () => {
  await mongoose.connection.close()
})