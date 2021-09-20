import React from "react";

import { useHistory } from "react-router-dom";

import axios from "../auth/axiosConfig";
import { BlogFormat } from "./blogFormat";

// For creating new blog
export function NewBlog (props){
  const history = useHistory();
  function handleClick (blogData) {
    axios
    .post('blogs/api/posts/create', blogData)
    .then(res => {
      props.createNotification('Blog Created', 'success')
      history.goBack(); 
    })
    .catch((error) => {
      props.createNotification(error, 'error')
    })
  
  }
  return (
    <BlogFormat handleClick={handleClick}/>
  );
}
  