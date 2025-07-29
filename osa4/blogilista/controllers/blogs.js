const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 , id: 1 })
    response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response, next) => { 
  const body = request.body

  if (!body.title) {
    return response.status(400).send({ error: 'Title is required' })
  }

  if (!body.url) {
    return response.status(400).send({ error: 'URL is required' })
  }

  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0,
    user: user._id
  })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  try {
    const user = request.user
    const blog = await Blog.findById(request.params.id)

    if (blog.user.toString() !== user._id.toString()) {
      return response.status(403).json({ error: 'Deleting blogs only possible for the user who created them' })
    }

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()

  } catch (exeption) {
    next(exeption)
  }
})

blogsRouter.put('/:id', async(request, response, next) => {
  const body = request.body

  blogToUpdate = await Blog.findById(request.params.id)

  if (!blogToUpdate) {
    return response.status(400).end()
  }

  if (!body.title) {
    return response.status(400).send({ error: 'Title is required' })
  }

  if (!body.url) {
    return response.status(400).send({ error: 'URL is required' })
  }

  blogToUpdate.title = body.title
  blogToUpdate.author = body.author
  blogToUpdate.url = body.url
  blogToUpdate.likes = body.likes

  try {
    const updatedBlog = await blogToUpdate.save()
    response.json(updatedBlog)
  } catch (exeption) {
    next(exeption)
  }
})

module.exports = blogsRouter