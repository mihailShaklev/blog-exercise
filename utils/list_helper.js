const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    console.log(sum, item.likes)
    return sum + item.likes
  }

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {

  const maxBlog = blogs[0]

  const reducer = (max, item) => {
    if(item.likes >= max.likes){
      max = item
      return max
    } else {
      return max
    }
  }

  return blogs.reduce(reducer, maxBlog)
}


const mostBlogs = (blogs) => {

  let firstBlog = blogs[0]
  let blogsByAuthor = blogs.filter((element) => element.author === firstBlog.author)
  let compareBlog = {
    author: firstBlog.author,
    blogs: blogsByAuthor.length
  }
  
  const reducer = (blog, item) => {  
     
    let author = item.author
    let foundBlogs = blogs.filter(item => item.author === author)
    
    if( foundBlogs.length >= blog.blogs ){
      blog = {
        author: author,
        blogs: foundBlogs.length
      }
    }

    return blog
    
  }

  return blogs.reduce(reducer, compareBlog)
    
}


const mostLikes = (blogs) => {

  const sumLikes = (sum, item) => {
    return sum + item.likes
  }

  const onlyUnique = (value, index, array) => {
    return array.indexOf(value) === index;
  }

  let firstAuthor = blogs[0].author
  let authorBlogs = blogs.filter(element => element.author === firstAuthor)
  let totalLikes = authorBlogs.reduce(sumLikes, 0)

  let compareAuthor = {
    author: firstAuthor,
    likes: totalLikes
  }

  const authors = blogs.map(blog => blog.author)
  const uniqueAuthors = authors.filter(onlyUnique)

  uniqueAuthors.forEach(author => {
    const foundBlogs = blogs.filter(blog => blog.author === author)
    const foundLikes = foundBlogs.reduce(sumLikes, 0)
    if (foundLikes >= compareAuthor.likes){
      compareAuthor = {
        author: author,
        likes: foundLikes
      }
    }
    
  });

  return compareAuthor

}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}