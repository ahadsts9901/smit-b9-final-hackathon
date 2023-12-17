import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./profile.css";
import { UserPost } from "../userPost/userPost";
import { Post } from "../post/post";
import { useParams } from "react-router-dom";
import { GlobalContext } from "../../context/context";
import { PencilFill } from "react-bootstrap-icons";

import { baseUrl } from "../../core.mjs";
import moment from "moment";

const Profile = () => {
  let { state, dispatch } = useContext(GlobalContext);

  const navigate = useNavigate();

  const [userPosts, setUserPosts] = useState([]);
  const [profile, setProfile] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef();

  // const userId = state.user.userId
  const { userParamsId } = useParams();

  // console.log(profile);

  useEffect(() => {
    renderCurrentUserPost();
    getProfile();

    return () => {
      // cleanup function
    };
  }, [userParamsId]);

  if (selectedImage) {
    Swal.fire({
      title: "Edit profile picture",
      html: `
        <img src="${selectedImage}" class="profileImageSelect" />
      `,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Upload",
      cancelButtonColor: "#284352",
      confirmButtonColor: "#284352",
    }).then((result) => {
      if (result.isConfirmed) {
        let formData = new FormData();

        formData.append("profileImage", fileInputRef.current.files[0]);
        formData.append("userId", state.user.userId);

        Swal.fire({
          title: `<span class="loader"></span>`,
          text: "Uploading...please don't cancel",
          allowOutsideClick: false,
          showConfirmButton: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });

        axios
          .post(`${baseUrl}/api/v1/profilePicture`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then(function (response) {
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
              title: "Profile picture updated",
            });
          })
          .catch(function (error) {
            console.log(error);
            Swal.fire({
              // icon:"error",
              title: "Can't update profile picture",
              timer: 2000,
              showConfirmButton: false,
              showCancelButton: true,
              cancelButtonColorL: "#284352",
              cancelButtonText: "Ok",
            });
          });

        setSelectedImage("");
      }
    });
  }

  const changeName = async () => {
    Swal.fire({
      title: "Update Name",
      html:
        `<input id="swal-input1" minLength="3" maxLength="10" class="swal2-input" placeholder="First Name" value="${state.user.firstName}">` +
        `<input id="swal-input2" minLength="3" maxLength="10" class="swal2-input" placeholder="Last Name" value="${state.user.lastName}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
      cancelButtonColor: " #284352",
      confirmButtonColor: " #284352",
      preConfirm: async () => {
        const firstName = document.getElementById("swal-input1").value;
        const lastName = document.getElementById("swal-input2").value;

        // Perform input validation

        const validateInput = (inputId) => {
          const inputElement = document.getElementById(inputId);
          const inputValue = inputElement.value.trim();

          if (inputValue === "") {
            inputElement.classList.add("swal-validation-error");
            return false;
          } else {
            inputElement.classList.remove("swal-validation-error");
            return true;
          }
        };

        if (!validateInput("swal-input1") || !validateInput("swal-input2")) {
          Swal.showValidationMessage("Please fill in both fields");
          return false;
        }

        Swal.fire({
          title: `<span class="loader"></span>`,
          text: "Uploading...please don't cancel",
          allowOutsideClick: false,
          showConfirmButton: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const updateNameResponse = await axios.put(
            `${baseUrl}/api/v1/update-name`,
            {
              firstName: firstName,
              lastName: lastName,
              userId: state.user.userId,
            }
          );

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
            title: "Name updated",
          });
        } catch (error) {
          console.log(error);
          Swal.fire({
            // icon:"error",
            title: "Can't update name",
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

  const changeEmail = async () => {
    Swal.fire({
      title: "Update Email",
      html:
        `<input id="swal-input1-Email" class="swal2-input" placeholder="New email">` +
        `<input type="password" id="swal-input2-Password" minLength="4" maxLength="8" class="swal2-input" placeholder="Password">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
      cancelButtonColor: " #284352",
      confirmButtonColor: " #284352",
      preConfirm: async () => {
        const email = document.getElementById("swal-input1-Email").value;
        const password = document.getElementById("swal-input2-Password").value;

        // Perform email password validation

        const validatePassword = async (inputId) => {
          const passwordElement = document.getElementById(inputId);
          const passwordValue = passwordElement.value.trim();

          // console.log("yes");

          if (passwordValue === "" || passwordValue > 8) {
            passwordElement.classList.add("swal-validation-error");
            return false;
          } else {
            passwordElement.classList.remove("swal-validation-error");
            return true;
          }
        };

        const validateEmail = (inputId) => {
          const emailElement = document.getElementById(inputId);
          const emailValue = emailElement.value.trim();

          if (
            emailValue === ""
            //  || !emailValue.endsWith("@gmail.com")
          ) {
            emailElement.classList.add("swal-validation-error");
            return false;
          } else {
            emailElement.classList.remove("swal-validation-error");
            return true;
          }
        };

        if (!validatePassword("swal-input2-Password")) {
          Swal.showValidationMessage("Invalid Password");
          return false;
        }

        if (!validateEmail("swal-input1-Email")) {
          Swal.showValidationMessage("Invalid Email");
          return false;
        }

        Swal.fire({
          title: `<span class="loader"></span>`,
          text: "Uploading...please don't cancel",
          allowOutsideClick: false,
          showConfirmButton: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const updateEmailResponse = await axios.put(
            `${baseUrl}/api/v1/update-email`,
            {
              email: email,
              password: password,
              userId: state.user.userId,
            }
          );

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
            title: "Email updated",
          });
        } catch (error) {
          console.log(error);
          // console.log(error.response.data.message);
          Swal.fire({
            title: "Error",
            text: `${error.response.data.message}`,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonColor: "#284352",
            cancelButtonText: "Ok",
          });
        }
      },
    });
  };

  const renderCurrentUserPost = () => {
    axios
      .get(`${baseUrl}/api/v1/posts/${userParamsId || ""}`)
      .then((response) => {
        // Handle the data returned from the API
        const userAllPosts = response.data;
        // console.log(userAllPosts)
        setUserPosts(userAllPosts);
        // This will contain the posts for the specified email
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error("Axios error:", error);
      });
  };

  const getProfile = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/profile/${userParamsId || ""}`
      );
      setProfile(response.data.data);
      // console.log(response.data.data);
    } catch (error) {
      console.log(error.data);
      setProfile("noUser");
    }
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
          renderCurrentUserPost();
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
                renderCurrentUserPost();
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

  const logOut = (event) => {
    event.preventDefault();

    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to log out?",
      // icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Log Out",
      confirmButtonColor: "#284352",
      cancelButtonColor: "#284352",
      showLoaderOnConfirm: true,
      preConfirm: () => {
        // Handle the logout logic here
        return axios
          .post(`${baseUrl}/api/v1/logout`, {})
          .then(function (response) {
            dispatch({
              type: "USER_LOGOUT",
            });
            window.location.pathname = "/login";
            return true;
          })
          .catch(function (error) {
            Swal.fire({
              // icon:"error",
              title: "Can't logout",
              timer: 2000,
              showConfirmButton: false,
              showCancelButton: true,
              cancelButtonColorL: "#284352",
              cancelButtonText: "Ok",
            });
            return false;
          });
      },
    });
  };

  const deleteAccount = async () => {
    Swal.fire({
      title: "Delete account",
      html: `<input type="password" id="swal-input2-Password-delete" minLength="4" maxLength="8" class="swal2-input" placeholder="Password">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      cancelButtonColor: " #284352",
      confirmButtonColor: " #284352",
      preConfirm: async () => {
        const password = document.getElementById(
          "swal-input2-Password-delete"
        ).value;

        // Perform email password validation

        const validatePassword = async (inputId) => {
          const passwordElement = document.getElementById(inputId);
          const passwordValue = passwordElement.value.trim();

          // console.log("yes");

          if (passwordValue === "" || passwordValue > 8) {
            passwordElement.classList.add("swal-validation-error");
            return false;
          } else {
            passwordElement.classList.remove("swal-validation-error");
            return true;
          }
        };

        if (!validatePassword("swal-input2-Password-delete")) {
          Swal.showValidationMessage("Invalid Password");
          return false;
        }

        Swal.fire({
          title: `<span class="loader"></span>`,
          text: "Deleting account...please don't cancel",
          allowOutsideClick: false,
          showConfirmButton: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const deleteAccountResponse = await axios.delete(
            `${baseUrl}/api/v1/delete-account`,
            {
              data: {
                password: password,
                userId: state.user.userId,
              },
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

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
            title: "Account deleted",
          });
        } catch (error) {
          console.log(error);
          // console.log(error.response.data.message);
          Swal.fire({
            title: "Error",
            text: `${error.response.data.message}`,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonColor: "#284352",
            cancelButtonText: "Ok",
          });
        }
      },
    });
  };

  const deleteAccountAdmin = async () => {
    Swal.fire({
      title: "Delete account",
      text: "Are you sure to delete this account",
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      cancelButtonColor: " #284352",
      confirmButtonColor: " #284352",
      preConfirm: async () => {
        Swal.fire({
          title: `<span class="loader"></span>`,
          text: "Deleting account...please don't cancel",
          allowOutsideClick: false,
          showConfirmButton: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const deleteAccountResponse = await axios.delete(
            `${baseUrl}/api/v1/delete-account-admin?userId=${profile.userId}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

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
            title: "Account deleted",
          });
        } catch (error) {
          console.log(error);
          // console.log(error.response.data.message);
          Swal.fire({
            title: "Error",
            text: `${error.response.data.message}`,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonColor: "#284352",
            cancelButtonText: "Ok",
          });
        }
      },
    });
  };

  const seePic = () => {
    Swal.fire({
      html: `
        <img src="${profile.profileImage}" class="profileImageSelect" />
      `,
      showCancelButton: false,
      showConfirmButton: true,
      // cancelButtonText: "Cancel",
      confirmButtonText: "Download",
      // cancelButtonColor: "#284352",
      confirmButtonColor: "#284352",
      preConfirm: async () => {
        var element = document.createElement("a");
        var file = new Blob([`"${profile.profileImage}"`], { type: "image/*" });
        element.href = URL.createObjectURL(file);
        element.download = `profile-photo-${new Date().toLocaleString()}`;
        element.click();
      },
    });
  };

  return (
    <div className="posts">
      <div className="backBtn">
        <h2
          className="bi bi-arrow-left pointer"
          onClick={() => {
            window.history.back();
          }}
        ></h2>
      </div>
      {profile === "noUser" ? (
        <div className="noUser">No User Found</div>
      ) : (
        <>
          <div className="profile">
            <img
              className="profileIMG"
              src={profile.profileImage}
              onClick={seePic}
            />

            <h2 className="profileName">
              {profile.firstName} {profile.lastName}
              {state.user.userId === profile.userId ? (
                <PencilFill
                  onClick={changeName}
                  style={{ fontSize: "0.5em" }}
                  className="pencil"
                />
              ) : null}
            </h2>

            <h3 className="profileEmail">
              {state.user.userId === profile.userId ? (
                <span>
                  {`${profile.email} `}{" "}
                  <PencilFill
                    style={{ fontSize: "0.7em" }}
                    onClick={changeEmail}
                    className="pencil"
                  />
                </span>
              ) : null}
              <span style={{ color: "#212121" }}>
                Joined {`${moment(profile.createdOn).format("ll")} `}
              </span>
            </h3>

            <div className="profileActions">
              <button
                className="logOutButton"
                onClick={() => {
                  navigate(`/chat/${profile.userId}`);
                }}
              >
                Message
              </button>
              {state.user.userId === profile.userId ? (
                <button className="logOutButton" onClick={logOut}>
                  Log Out
                </button>
              ) : null}
            </div>

            {state.user.isAdmin == true ? (
              <h2 className="delAcc" onClick={deleteAccountAdmin}>
                Delete Account
              </h2>
            ) : state.user.userId === profile.userId ? (
              <h2 className="delAcc" onClick={deleteAccount}>
                Delete Account
              </h2>
            ) : null}

            <div className="profileImageContainer">
              <label className="editIMG" htmlFor="profileImage">
                {state.user.userId === profile.userId ? (
                  <PencilFill
                    style={{ fontSize: "0.8em" }}
                    className="pencil"
                  />
                ) : null}
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className="file hidden"
                id="profileImage"
                accept="image/*"
                onChange={(e) => {
                  const base64Url = URL.createObjectURL(e.target.files[0]);
                  setSelectedImage(base64Url);
                }}
              />
            </div>
          </div>

          <div className="result">
            {!userPosts ? (
              <h2 className="noPostMessage">No Post Found</h2>
            ) : userPosts.length === 0 ? (
              <div className="loadContainer">
                <h2 className="noPostMessage">No Post Found</h2>
              </div>
            ) : (
              userPosts.map((post, index) =>
                state.user.userId === profile.userId ||
                state.isAdmin == true ? (
                  <UserPost
                    key={index}
                    title={post.title}
                    text={post.text}
                    time={post.time}
                    postId={post._id}
                    image={post.image}
                    userId={post.userId}
                    userImage={post.userImage}
                    del={deletePost}
                    edit={editPost}
                    likedBy={post.likes}
                  />
                ) : (
                  <Post
                    key={index}
                    title={post.title}
                    text={post.text}
                    time={post.time}
                    postId={post._id}
                    userId={post.userId}
                    image={post.image}
                    likedBy={post.likes}
                    userImage={post.userImage}
                  />
                )
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
