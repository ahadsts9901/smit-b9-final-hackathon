import React, { useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./search.css";
import "../main.css";
// import logo from "../assets/logoDark.png"
import { Search as SearchBS, ArrowLeft } from "react-bootstrap-icons";
import { Post } from "../post/post";

import { baseUrl } from "../../core.mjs";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [posts, setPosts] = useState([]);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const search = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/search?q=${searchInputRef.current.value}`
      );
      // console.log(response.data);

      setPosts([...response.data]);
    } catch (error) {
      console.log(error.data);
    }
    e.target.reset();
  };

  const deletePost = (postId) => {
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
            },
          });
          Toast.fire({
            // icon: "success",
            title: "Post deleted",
          });
          navigate("/");
        } catch (error) {
          console.log(error.data);
          Swal.fire({
            // icon:"error",
            title: "Failed to delete post",
            timer: 2000,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonColorL: "#284352",
            cancelButtonText: "Ok",
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
                  },
                });
                Toast.fire({
                  // icon: "success",
                  title: "Post updated",
                });
                navigate("/");
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
                  cancelButtonText: "Ok",
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
          cancelButtonText: "Ok",
        });
      });
  }

  return (
    <div className="searchCont">
      <form className="search postForm" onSubmit={search}>
        <button
          type="button"
          className="searchButton"
          onClick={() => {
            window.history.back();
          }}
        >
          <ArrowLeft />
        </button>
        <input
          required
          type="search"
          placeholder="Search Here..."
          className="searchInput"
          ref={searchInputRef}
        />
        <button type="submit" className="postButton searchButton">
          <SearchBS />
        </button>
      </form>
      <div className="searchResult">
        {posts.length === 0 ? (
          <h2 className="noPostMessage">
            {" "}
            <SearchBS /> Search Post . . .{" "}
          </h2>
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
    </div>
  );
};

export default Search;
