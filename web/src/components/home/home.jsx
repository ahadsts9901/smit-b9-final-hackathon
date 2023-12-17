import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import "./home.css";
import { Post, NoPost } from "../post/post";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../../context/context";
import Swal from "sweetalert2";

import { baseUrl } from "../../core.mjs";

const Home = () => {
  let { state, dispatch } = useContext(GlobalContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    renderPost();

    return () => {
      // cleanup function
    };
  }, []);

  // pagination

  // const handleScroll = () => {
  //   const container = document.querySelector(".result");

  //   if (container) {
  //     // Calculate the sum of the scroll position and the container's client height
  //     const scrollSum = container.scrollTop + container.clientHeight;

  //     // Check if the sum is equal to or greater than the scroll
  //     if (scrollSum == container.scrollHeight) {
  //       loadMore();
  //     }
  //   }
  // };

  // pagination

  // const loadMore = () => {
  //   axios
  //     .get(`${baseUrl}/api/v1/feed?page=${posts.length}`)
  //     .then(function (response) {
  //       let fetchedPosts = response.data;
  //       setPosts((prev) => {
  //         return [...prev, ...response.data];
  //       });
  //     })
  //     .catch(function (error) {
  //       // console.log(error);
  //       let resStatus = error.response.request.status;
  //       // console.log(resStatus)
  //       if (resStatus === 401) {
  //         // console.log("not authorized")
  //         navigate("/login");
  //       }
  //     });
  // };

  const renderPost = () => {
    axios
      .get(`${baseUrl}/api/v1/feed`)
      .then(function (response) {
        let fetchedPosts = response.data;
        // console.log("fetched posts", fetchedPosts);
        setPosts(fetchedPosts);
      })
      .catch(function (error) {
        // console.log(error);
        let resStatus = error.response.request.status;
        // console.log(resStatus)
        if (resStatus === 401) {
          // console.log("not authorized")
          navigate("/login");
        }
      });
  };

  const deletePost = (postId, userId) => {
    Swal.fire({
      title: "Delete Post",
      text: "Are you sure you want to delete this post?",
      // icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
      showConfirmButton: true,
      confirmButtonColor: "#284352",
      showCancelButton: true,
      cancelButtonColor: "#284352",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await axios.delete(
            `${baseUrl}/api/v1/post/${postId}`
          );
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
          renderPost();
        } catch (error) {
          console.log(error.data);
          Swal.fire({
            // icon:"error",
            title: "Failed to delete post",
            timer: 2000,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonColorL: "#284352",
            cancelButtonText: "Ok"
          });
        }
      },
    });
  };

  function editPost(postId) {
    axios
      .get(`${baseUrl}/api/v1/post/${postId}`)
      .then((response) => {
        const post = response.data;

        Swal.fire({
          title: "Edit Post",
          html: `
            <textarea id="editText" class="swal2-input text" placeholder="Post Text" required>${post.text}</textarea>
          `,
          showCancelButton: true,
          cancelButtonText: "Cancel",
          confirmButtonText: "Update",
          showConfirmButton: true,
          confirmButtonColor: "#284352",
          showCancelButton: true,
          cancelButtonColor: "#284352",
          showLoaderOnConfirm: true,
          preConfirm: () => {
            const editedText = document.getElementById("editText").value;

            if (!editedText.trim()) {
              Swal.showValidationMessage("Title and text are required");
              return false;
            }

            return axios
              .put(`${baseUrl}/api/v1/post/${postId}`, {
                text: editedText,
              })
              .then((response) => {
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
                renderPost();
              })
              .catch((error) => {
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
          },
        });
      })
      .catch((error) => {
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
    <>
      <div className="result"
      //  onScroll={handleScroll}
      >
        {!posts ? (
          <span className="loader"></span>
        ) : posts.length === 0 ? (
          <div className="loadContainer">
            <span className="loader"></span>
          </div>
        ) : (
          posts.map((post, index) => (
            <Post
              key={index}
              title={post.title}
              text={post.text}
              time={post.time}
              postId={post._id}
              userId={post.userId}
              image={post.image}
              userImage={post.userImage}
              likedBy={post.likes}
              del={deletePost}
              edit={editPost}
            />
          ))
        )}
      </div>
    </>
  );
};

export default Home;
