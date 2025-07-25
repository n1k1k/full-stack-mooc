const blog = require("../models/blog")

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, currentBlog) => {
    return sum +  currentBlog.likes
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

const favouriteBlog = (blogs) => {
  const maxLikes = (max, currentBlog) => {
    return currentBlog.likes > max.likes
      ? currentBlog
      : max
  }

  return blogs.length === 0
    ? null
    : blogs.reduce(maxLikes, blogs[0])
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog
}