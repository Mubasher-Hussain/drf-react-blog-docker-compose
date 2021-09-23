import React from "react";

import { useHistory, useLocation } from "react-router-dom";

import axios from "../auth/axiosConfig";
import { BlogFormat } from "./blogFormat";


// For editing already created blogs
export  function EditBlog (props){
  let pk = props.match.params.pk;
  const {query} = useLocation();
  const history = useHistory();
  function handleClick (blogData) {
    axios
    .put(`blogs/api/post/${pk}/edit`, blogData)
    .then(res => {
      props.createNotification('Blog Updated', 'success');
      history.goBack();
    })
    .catch( (error) => props.createNotification(error.message + '.Either Unauthorised or Empty Field', 'error')) 
  }
  return (
    <BlogFormat handleClick={handleClick} blogData={query}/>
  );
}
  