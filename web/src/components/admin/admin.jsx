import './admin.css';
import '../main.css'
import { UserPost } from "../userPost/userPost"
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { GlobalContext } from '../../context/context';

import { baseUrl } from '../../core.mjs';

const Admin = () => {

  let { state, dispatch } = useContext(GlobalContext);

  const [adminPosts, setAdminPosts] = useState([]);

  useEffect(() => {
    renderAdminPost();

    return () => {
      // cleanup function
    };

  }, []);

  const renderAdminPost = () => {
    axios.get(`${baseUrl}/api/v1/feed/`)
      .then((response) => {
        // Handle the data returned from the API
        const userAllPosts = response.data;
        setAdminPosts(userAllPosts)
        // This will contain the posts for the specified email
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error('Axios error:', error);
      });
  };

  const deletePost = (postId, userId) => {
    Swal.fire({
      title: 'Delete Post',
      text: 'Are you sure you want to delete this post?',
      // icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Delete',
      showConfirmButton: true,
      confirmButtonColor: "#284352",
      showCancelButton: true,
      cancelButtonColor: "#284352",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await axios.delete(`${baseUrl}/api/v1/post/${postId}`);
          // console.log(response.data);
          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1200,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          });
          Toast.fire({
            // icon: "success",
            title: "Post deleted"
          });

          const sentNotification = await axios.post(
            `${baseUrl}/api/v1/notification`,
            {
              fromId: state.user.userId,
              toId: userId,
              actionId: state.user.userId,
              message: `"${state.user.firstName} ${state.user.lastName}" admin of "WE App" removed your post`,
              senderImage: state.user.profileImage,
              senderName: `${state.user.firstName} ${state.user.lastName}`,
              location: "profile"
            }
          );

          renderAdminPost();
        } catch (error) {
          console.log(error.data);
          Swal.fire({
            // icon:"error",
            title: "Error in deleting post",
            timer: 2000,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonColorL: "#284352",
            cancelButtonText: "Ok"
          });
        }
      }
    });
  }

  function editPost(postId) {
    axios.get(`${baseUrl}/api/v1/post/${postId}`)
      .then(response => {
        const post = response.data;

        Swal.fire({
          title: 'Edit Post',
          html: `
            <textarea id="editText" class="swal2-input text" placeholder="Post Text" required>${post.text}</textarea>
          `,
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Update',
          showConfirmButton: true,
          confirmButtonColor: "#284352",
          showCancelButton: true,
          cancelButtonColor: "#284352",
          showLoaderOnConfirm: true,
          preConfirm: () => {

            const editedText = document.getElementById('editText').value;

            if (!editedText.trim()) {
              Swal.showValidationMessage('Title and text are required');
              return false;
            }

            return axios.put(`${baseUrl}/api/v1/post/${postId}`, {
              text: editedText
            })
              .then(response => {
                // console.log(response.data);
                const Toast = Swal.mixin({
                  toast: true,
                  position: "top-end",
                  showConfirmButton: false,
                  timer: 1200,
                  timerProgressBar: true,
                  didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                  }
                });
                Toast.fire({
                  // icon: "success",
                  title: "Post updated"
                });
                renderAdminPost();
              })
              .catch(error => {
                // console.log(error.response.data);
                Swal.fire({
                  // icon:"error",
                  title: "Failed to update post",
                  timer: 2000,
                  showConfirmButton: false,
                  showCancelButton: true,
                  cancelButtonColorL: "#284352",
                  cancelButtonText: "Ok"
                });
              });
          }
        });
      })
      .catch(error => {
        // console.log(error.response.data);
        Swal.fire({
          // icon:"error",
          title: "Failed to fetch post",
          timer: 2000,
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonColorL: "#284352",
          cancelButtonText: "Ok"
        });
      });
  }

  return (
    <div className='posts adminPosts'>
      <h2 className="adminHeading">Admin Dashboard</h2>
      <div className="result">
        {!adminPosts ? <span className="loader"></span> : (adminPosts.length === 0 ? (
          <div className="loadContainer">
            <span className="loader"></span>
          </div>
        ) : (
          adminPosts.map((post, index) => (
            <UserPost key={index} title={post.title} text={post.text} time={post.time} postId={post._id} userId={post.userId} image={post.image} userImage={post.userImage} del={deletePost} edit={editPost} likedBy={post.likes} />
          ))
        ))}
      </div>
    </div>
  );

};

export default Admin;