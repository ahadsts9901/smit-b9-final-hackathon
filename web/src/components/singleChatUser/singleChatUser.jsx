import React from 'react'
import "./singleChatUser.css"
import { useNavigate } from 'react-router-dom'

import { baseUrl } from '../../core.mjs';
 
const SingleChatUser = (props) => {

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

export default SingleChatUser
