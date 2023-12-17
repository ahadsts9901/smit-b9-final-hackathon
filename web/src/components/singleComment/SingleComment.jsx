import React, { useState, useContext, useEffect } from "react";
import "./SingleComment.css";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ChevronDown, ChevronUp, HandThumbsUp, HandThumbsUpFill } from "react-bootstrap-icons";
import { GlobalContext } from "../../context/context";
import axios from "axios";
import { baseUrl } from "../../core.mjs";

const SingleComment = (props) => {
  const { state, dispatch } = useContext(GlobalContext);
  const [showFullComment, setShowFullComment] = useState(false);
  const formattedTime = moment(props.time).fromNow();
  const fullComment = props.comment;
  const splittedComment = props.comment.split(" ").slice(0, 20).join(" ");
  const [showAction, setShowAction] = useState(false);
  const [isLike, setIsLike] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {

    const userHasLiked = props.likes.some(
      (likeUser) => likeUser.userId === state.user.userId
    );

    setIsLike(userHasLiked);

    return () => {
      // cleanup function
    };
  }, [props.likes, state.user.userId]);

  const toggleShowFullComment = () => {
    setShowFullComment(!showFullComment);
  };

  const doLike = async (commentId) => {
    try {

      const userHasLiked = props.likes.some(
        (likeUser) => likeUser.userId === state.user.userId
      );

      if (userHasLiked) {
        // Undo like if already liked
        await undoLike(commentId);
        return;
      }

      // Make the API call to add the like
      const response = await axios.post(
        `${baseUrl}/api/v1/comment/${commentId}/dolike`,
        {
          userId: state.user.userId,
          decoded: state.user,
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
            actionId: commentId,
            message: `${state.user.firstName} ${state.user.lastName} liked your comment`,
            senderImage: state.user.profileImage,
            senderName: `${state.user.firstName} ${state.user.lastName}`,
            location: "likes/comment"
          }
        );

        // console.log("notification sent");
      }
    } catch (error) {
      // Handle error
      console.log("Error adding like:", error);
    }
  };

  const undoLike = async (commentId) => {
    try {
      // Make the API call to remove the like
      const response = await axios.delete(
        `${baseUrl}/api/v1/comment/${commentId}/undolike`,
        {
          data: { userId: state.user.userId },
        }
      );

      if (response.data === "Like removed successfully") {
        setIsLike(false); // Update the like button
        const delNotification = await axios.delete(
          `${baseUrl}/api/v1/delete/notification`,
          {
            data: {
              fromId: state.user.userId,
              toId: props.userId,
              actionId: props._id,
            },
          }
        );
      }
    } catch (error) {
      // Handle error
      console.log("Error removing like:", error);
    }
  };

  return (
    <div className="singleComment">
      {state.user.userId === props.userId || props.authorId === state.user.userId || state.user.isAdmin === true ? (
        <div className="actionContComment">
          {showAction ? (
            <>
              <ChevronUp className="pointer"
                onClick={() => {
                  setShowAction(!showAction);
                }}
              />
              <div className="commentMenu pointer">
                {state.user.userId === props.userId && (
                  <p className="pointer"
                    onClick={(event) => {
                      props.edit(props._id, event);
                    }}
                  >
                    Edit
                  </p>
                )}
                <p className="pointer"
                  onClick={() => {
                    props.del(props._id);
                  }}
                >
                  Delete
                </p>
              </div>
            </>
          ) : (
            <ChevronDown className="pointer"
              onClick={() => {
                setShowAction(!showAction);
              }}
            />
          )}
        </div>
      ) : null}
      <div
        className="singleCommentHead pointer"
        onClick={() => {
          navigate(`/profile/${props.userId}`);
        }}
      >
        <img src={props.image} alt="image" />
        <b>{props.userName}</b>
        <span id="time">{formattedTime}</span>
      </div>
      <div className="commentTextContainer">
        <p className="commentText">
          <span>{showFullComment ? fullComment : splittedComment}</span>
          {splittedComment !== fullComment && (
            <span className="see" onClick={toggleShowFullComment}>
              {showFullComment ? "...see less" : "...see more"}
            </span>
          )}
        </p>
      </div>
      <div className="likesContComment">
        <span id="commentLikeBtn" onClick={() => {
          doLike(props._id);
        }}>
          <span>
            {isLike ? <HandThumbsUpFill /> : <HandThumbsUp />}

          </span>
          <p>Likes</p>
          {
            props.likes.length > 0 ? `( ${props.likes.length} )` : null
          }
        </span>
        <span id="totalCommentLikes" onClick={() => { navigate(`/likes/comment/${props._id}`) }}>
          <ArrowUpRight />
          <p>See All</p>
        </span>
      </div>
    </div>
  );
};

export default SingleComment;