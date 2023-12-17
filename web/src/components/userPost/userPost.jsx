import "./userPost.css";
import moment from "moment";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { GlobalContext } from "../../context/context";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { baseUrl } from "../../core.mjs";

const UserPost = (props) => {
  let { state, dispatch } = useContext(GlobalContext);

  const [totalComments, setTotalComments] = useState("");

  const navigate = useNavigate();

  const postId = props.postId;

  useEffect(() => {
    getComments(postId);
  }, [postId]);

  useEffect(() => {
    if (!Array.isArray(props.likedBy)) {
      props.likedBy = [];
    }

    const userHasLiked = props.likedBy.some(
      (likeUser) => likeUser.userId === state.user.userId
    );

    setIsLike(userHasLiked);
  }, [props.likedBy, state.user.userId]);

  const [showFullPost, setShowFullPost] = useState(false);
  const [isLike, setIsLike] = useState(false);

  const formattedTime = moment(props.time).fromNow();
  const fullText = props.text;
  const splittedText = props.text.split(" ").slice(0, 40).join(" ");

  const toggleShowFullPost = () => {
    setShowFullPost(!showFullPost);
  };

  const doLike = async (_id, event) => {
    try {
      // Create an empty array if props.likedBy is undefined
      if (!Array.isArray(props.likedBy)) {
        props.likedBy = [];
      }

      // Debugging: Log the values to understand what's happening
      // console.log("state.user.userId:", state.user.userId);
      // console.log("props.likedBy:", props.likedBy);

      const userHasLiked = props.likedBy.some(
        (likeUser) => likeUser.userId === state.user.userId
      );

      if (userHasLiked) {
        // console.log("You've already liked this post.");
        undoLike(_id, event);
        return;
      }

      // Make the API call to add the like
      const response = await axios.post(
        `${baseUrl}/api/v1/post/${_id}/dolike`,
        {
          userId: state.user.userId,
          profileImage: state.user.profileImage,
        }
      );

      if (response.data === "Like added successfully") {
        setIsLike(true);
        const sentNotification = await axios.post(
          `${baseUrl}/api/v1/notification`,
          {
            fromId: state.user.userId,
            toId: props.userId,
            actionId: props.postId,
            message: `${state.user.firstName} ${state.user.lastName} liked your post`,
            senderImage: state.user.profileImage,
            senderName: `${state.user.firstName} ${state.user.lastName}`,
            location: "likes/post"
          }
        );

        // console.log("notification sent");
      }

      let thumb = event.target.firstElementChild;
      thumb.classList.remove("bi-hand-thumbs-up");
      thumb.classList.add("bi-hand-thumbs-up-fill");
      setIsLike(true);
    } catch (error) {
      // Handle error
      console.log("Error adding like:", error);
    }
  };

  const undoLike = async (_id, event) => {
    try {
      // Make the API call to remove the like
      const response = await axios.delete(
        `${baseUrl}/api/v1/post/${_id}/undolike`,
        {
          data: { userId: state.user.userId },
        }
      );

      if (response.data === "Like removed successfully") {
        setIsLike(false);
        const delNotification = await axios.delete(
          `${baseUrl}/api/v1/delete/notification`,
          {
            data: {
              fromId: state.user.userId,
              toId: props.userId,
              actionId: props.postId,
            },
          }
        );
      }

      let thumb = event.target.firstElementChild;
      thumb.classList.add("bi-hand-thumbs-up");
      thumb.classList.remove("bi-hand-thumbs-up-fill");
      setIsLike(false);
    } catch (error) {
      // Handle error
      console.log("Error removing like:", error);
    }
  };

  const seePost = (postId) => {
    navigate(`/post/${postId}`);
  };

  const getProfile = async (userId) => {
    navigate(`/profile/${userId}`);
  };

  const getComments = async (postId) => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/comments/${postId}`);
      const comments = response.data;
      setTotalComments(comments.length);
    } catch (error) {
      console.error("An error occurred while fetching comments:", error);
    }
  };

  const showFullImg = () => {
    Swal.fire({
      html: `
        <img src="${props.image}" class="postImageSelect" />
      `,
      showCancelButton: false,
      showConfirmButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Download",
      cancelButtonColor: "#284352",
      confirmButtonColor: "#284352",
      preConfirm: async () => {
        var element = document.createElement("a");
        var file = new Blob([`"${props.image}"`], { type: "image/*" });
        element.href = URL.createObjectURL(file);
        element.download = `post-${new Date().toLocaleString()}`;
        element.click();
      },
    });
  };

  const shareFun = () => {
    let url = window.location.origin + "/post/" + props.postId;
    navigator.clipboard.writeText(url).then(() => {
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
        title: "Link copied to clipboard",
      });
    });
  };

  return (
    <div className="singlePost">
      <div
        className="postHead"
        onClick={() => {
          getProfile(props.userId);
        }}
      >
        <img src={props.userImage} alt="Profile" />
        <div className="postNames">
          <h2>{props.title}</h2>
          <p>{formattedTime}</p>
        </div>
      </div>
      <div className="textContainer">
        <p
          className={`${fullText.length <= 40
            ? props.image
              ? "smallText"
              : "bigText"
            : "smallText"
            }`}
        >
          <span
            onClick={() => {
              seePost(props.postId);
            }}
          >
            {showFullPost ? fullText : splittedText}
          </span>
          {splittedText !== fullText && (
            <span className="see" onClick={toggleShowFullPost}>
              {showFullPost ? "...see less" : "...see more"}
            </span>
          )}
        </p>
        {props.image && (
          <img
            src={props.image}
            width="425"
            height="300"
            alt="post image"
            className="postImg"
            onClick={showFullImg}
          />
        )}
      </div>
      <div className="buttonContainer">
        <button
          onClick={(event) => {
            doLike(props.postId, event);
          }}
        >
          <i
            className={`bi ${!isLike ? "bi-hand-thumbs-up" : "bi-hand-thumbs-up-fill"
              }`}
          ></i>
          <span id="likesCount">
            Likes
            {props.likedBy
              ? props.likedBy.length == 0
                ? ""
                : ` ( ${props.likedBy.length} )`
              : null}
          </span>
        </button>
        <button
          onClick={() => {
            seePost(props.postId);
          }}
        >
          <i className="bi bi-chat-square"></i>
          {totalComments == 0 ? (
            "Comments"
          ) : (
            <p>Comments ( {totalComments} )</p>
          )}
        </button>
        <button onClick={shareFun}>
          <i className="bi bi-share-fill"></i>Share
        </button>
      </div>
      <div className="buttonContainer">
        <>
          {state.user.userId === props.userId ? (
            <button
              className="editDelBtns"
              onClick={() => props.edit(props.postId)}
            >
              <i className="bi bi-pencil-fill"></i>Edit
            </button>
          ) : null}
          {state.user.isAdmin === true || state.user.userId === props.userId ? (
            <button
              className="editDelBtns"
              onClick={() => props.del(props.postId, props.userId)}
            >
              <i className="bi bi-trash-fill"></i>Delete
            </button>
          ) : null}
        </>
      </div>
    </div>
  );
};

const NoPost = () => {
  return <h2 className="noPostsMessage">No post found...</h2>;
};

export { UserPost, NoPost };
