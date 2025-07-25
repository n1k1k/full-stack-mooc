
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

const mostBlogs = (blogs) => {
  const maxBlogs = (max, current) => {
    return current[1] > max[1]
      ? current
      : max
  }

  const numberOfBlogs = blogs.reduce((counts, blog) => ({
    ...counts,
    [blog.author]: (counts[blog.author] || 0) + 1
  }), {})

  const result = Object.entries(numberOfBlogs).reduce(maxBlogs, ['', 0])

  return blogs.length === 0
    ? null
    : { author: result[0], blogs: result[1] }
}

const mostLikes = (blogs) => {
  const maxLikes = (max, current) => {
    return current[1] > max[1]
      ? current
      : max
  }

  const numberOfLikes = blogs.reduce((counts, blog) => ({
    ...counts,
    [blog.author]: (counts[blog.author] || 0) + blog.likes
  }), {})

  const result = Object.entries(numberOfLikes).reduce(maxLikes, ['', 0])

  return blogs.length === 0
    ? null
    : { author: result[0], likes: result[1] }
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes
}