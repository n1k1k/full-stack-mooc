const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
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

test.only('returned blogs have an id field', async () => {
  const response = await api.get('/api/blogs')  
  
  response.body.forEach(blog => {
    assert.strictEqual(blog.hasOwnProperty('id'), true)
  })
})

test.only('returned blogs do not have an _id field', async () => {
  const response = await api.get('/api/blogs')  
  
  response.body.forEach(blog => {
    assert.strictEqual(blog.hasOwnProperty('_id'), false)
  })
})

after(async () => {
  await mongoose.connection.close()
})