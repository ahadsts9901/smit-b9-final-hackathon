import React from 'react'
import "./SingleChatUser.css"
import { useNavigate } from 'react-router-dom'

const SingleChatUser_ = (props) => {

  const navigate = useNavigate()

  return (
    <div className='singleChatUser' onClick={() => { navigate(`/chat/${props.userId}`) }} >
      <img src={props.image} />
      <p className='chatUserName'>{props.userName}</p>
      {/* <span id="lastSeen">
        today at 09:30 AM
      </span> */}
    </div>
  )
}

export default SingleChatUser_
