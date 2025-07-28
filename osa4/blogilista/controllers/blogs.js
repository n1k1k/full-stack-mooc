const blogsRouter = require('express').Router()
const { request, response } = require('../app')
const Blog = require('../models/blog')
const { blogsInDb } = require('../tests/test_helper')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => { 
  const body = request.body

  if (!body.title) {
    return response.status(400).send({ error: 'Title is required' })
  }

  if (!body.url) {
    return response.status(400).send({ error: 'URL is required' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0
  })

  try {
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
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