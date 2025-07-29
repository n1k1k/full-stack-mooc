const assert = require('node:assert')
const { test, after, beforeEach, describe, before } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

describe('when there is intially some blogs saved', () => {
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

describe('when there is initially one user in db', () => {
  describe('addition of a new user', () => {
    beforeEach(async () => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash('testPassword', 10)
      const user = new User({
        username: 'root',
        name: 'Root User',
        passwordHash: passwordHash
      })

      await user.save()
    })

    test.only('succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'SpongeBob',
        name: 'SpongeBob SquarePants',
        password: 'BobPassword'
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

    test.only('fails with status code 400 and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb() 

      const newUser = {
        username: 'root',
        name: 'Root User',
        password: 'newPassword'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect(response => {
          assert(response.body.error.includes('username must be unique'))
        })
      
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test.only('fails with status code 400 and message if username less than 3 characters', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'ab',
        name: 'Test Name',
        password: 'validPassword'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect(response => {
          assert(response.body.error.includes('username must be at least 3 characters long'))
        })

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test.only('fails with status code 400 and message if password less than 3 characters', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'validUsername',
        name: 'Test Name',
        password: 'ab'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect(response => {
          assert(response.body.error.includes('password must be at least 3 characters long'))
        })

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})