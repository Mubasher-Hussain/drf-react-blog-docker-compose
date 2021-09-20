import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import axios from "../auth/axiosConfig";


// Displays All Blogs or specific by author
export function BlogsList({match}) {
  const author = match.params.author;
  const [blogsList, setBlogsList] = useState();
  const baseURL = 'blogs/api/posts';
  let url = `blogs/api/${author}/posts`;
  
  function displayList(){
      
    if (blogsList && blogsList.length){
      return blogsList.map((blog)=>{
        return(         
          <div class="col-md-12">
            <h2><NavLink to={'../blogDetails/' + blog.id} >{blog.title}</NavLink></h2>
            <p style={{ textAlign: 'left' }}>{blog.content.substring(0,50)}{blog.content.length>50 &&('........')}</p>
            <div style={{textAlign: "left"}}>
              <span class="badge">Updated: {blog.updated_at}</span>
              <div class="pull-right">
                <span class="label label-default">Author: <NavLink to={'../blogsList/' + blog.author} >{blog.author}</NavLink></span>
              </div>         
            </div>    
            <hr/>
          </div>            
        )
    })}
  }
  
  useEffect(() => {
    if (!author){
      url = baseURL;
    }
    axios
    .get(url)
    .then(res => {
      setBlogsList(res.data);
    })
    .catch( (error) => alert(error))  
  }, [author])
  
  return (
    <div class='blogList'>
      <h1>{author} Blogs List</h1>
      <hr/>
        <div class='container'>
          { displayList() }
        </div>
    </div>
  )
}
  