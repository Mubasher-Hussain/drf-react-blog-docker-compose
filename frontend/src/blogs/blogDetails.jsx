import React, { useEffect, useState } from "react";
import {
  NavLink,
  useHistory,
} from "react-router-dom";

import axios from "../auth/axiosConfig";
import { useAuth } from "../auth"


// Display Details of Blog and its comments
export function BlogDetails(props) {
  const pk = props.match.params.pk;
  const history = useHistory();
  const [logged] = useAuth();
  const [blogDetails, setBlogDetails] = useState({ post: null, comment_list: null, isAuth: '' });
  useEffect(async() => {
    const blogData = await axios(
      `blogs/api/post/${pk}`
    );
    const commentData = await axios(
      `blogs/api/post/${pk}/comments`
    )
    setBlogDetails({ post: blogData.data.post, comment_list: commentData.data, isAuth: blogData.data.isAuth })
  
  }, [])
  
  function deletePost(){
    let url = `blogs/api/post/${pk}/delete`;
    axios
    .delete(url)
    .then(res => {
      props.createNotification('Blog Deleted', 'success');
      history.goBack();
    })
    .catch( (error) => props.createNotification(error.message + '.Either Unauthorised or Empty Field', 'error'))
  }
  
  function displayDetail(){
    if (blogDetails && blogDetails.post){
      return (
        <div>
          <div class="col-md-12" style={{border: "1px solid black", marginBottom:'5px'}}>
            <h1>{blogDetails.post.title}</h1>
            <hr/>
            <p style={{minHeight: '100px', textAlign: 'left', overflow: 'auto'}}>{blogDetails.post.content}</p>
            <hr/>
            <div style={{textAlign: "left"}}>
              <span class="badge" tyle={{float: 'left'}}>Posted: {blogDetails.post.created_at}</span>
              <span class="badge">Updated: {blogDetails.post.updated_at}</span>
              <div class="pull-right">
                <span class="label label-default">Author: <NavLink to={'../blogsList/' + blogDetails.post.author} >{blogDetails.post.author}</NavLink></span>
              </div>         
            </div>    
            <hr/>
          </div>  
          {blogDetails.isAuth && (
            <p>
              <button className='btn' onClick={() => 
                history.push({pathname: `../editPost/${pk}`,
                              query: {title: blogDetails.post.title,
                                      content: blogDetails.post.content,}
                             })
                              }>
                Edit
              </button>
              <button type="button" className="btn" onClick={deletePost}>
              Delete
              </button>
            </p>
          )}
                  
        </div>
      )
    }
  }
  
  function displayComment(){
    if (blogDetails && blogDetails.comment_list){
      return blogDetails.comment_list.map((comment)=>{
        return <Comment comment={ comment } />
    })}
  }
  
  function createComment(){
    let comment = document.querySelector('.comment').value;
    axios
    .post(`blogs/api/post/${pk}/comments/create`, {'content': comment})
    .then(async(res) =>  {
      props.createNotification('Comment Created', 'success')
      history.push('../');
      history.push(`../blogDetails/${pk}`);
    })
    .catch( (error) => props.createNotification(error.message + '.Either Unauthorised or Empty Field', 'error'))
  }
  
  return (
    <div class="blogList">
      <div class='container'>
        { displayDetail()}
      </div>
      <div class="row height d-flex justify-content-center align-items-center">
        <div class="col-md-7">
          <div class="card">
            <div class="p-3">
              <strong>Comments</strong>
            </div>
            {logged && 
            <div class="mt-3 d-flex flex-row align-items-center p-3 form-color">
              <textarea class="form-control comment" style={{fontSize: '16px'}} name='comment' placeholder="Login to enter comment..."/>             
            </div>
            }
            {logged && <button class="btn btn-primary" type="submit" onClick={createComment}>Submit</button>}
            {!logged && <p>Login to comment</p>}
            <div className="comments" style={{maxHeight: '400px', overflow: 'auto'}}>
            { displayComment() }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

 
function Comment(params){
  
  return(
    <div style={{border:'1px solid black', marginBottom:'5px'}}>
      <div class="d-flex flex-row p-3">
        <div class="w-100">
        <p class="text-justify comment-text mb-0">{params.comment.content}</p>
        <hr/>
          <div style={{textAlign: "left"}}>
              <span class="badge" tyle={{float: 'left'}}> {params.comment.commentator}</span>
              <div class="pull-right">
                <span class="label label-primary">{params.comment.created_at}</span>
              </div>         
          </div>
        </div>
      </div>                     
    </div>
  )
} 
  