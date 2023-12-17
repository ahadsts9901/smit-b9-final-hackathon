import React, { useEffect, useState, useContext, useRef } from 'react'
import "./chat.css"
import "../chatScreen/chatScreen.css"
import { ArrowLeft, ThreeDotsVertical, Search as SearchBs } from "react-bootstrap-icons"
import SingleChatUser from '../singleChatUser/singleChatUser'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { GlobalContext } from '../../context/context';

import { baseUrl } from '../../core.mjs';

const Chat = () => {
  let { state, dispatch } = useContext(GlobalContext);

  const [users, setUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchText = useRef();
  const navigate = useNavigate();

  const getUsers = async (event) => {
    event.preventDefault();

    const text = searchText.current.value;

    if (!text) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${baseUrl}/api/v1/search-user?q=${text}`);
      setUsers(response.data);
      setIsLoading(false);
      event.target.reset()
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <div className='chatUsers'>
      <header>
        <div className='headSect'>
          <ArrowLeft onClick={() => { window.history.back() }} />
          <img className='chatScreenImg' src={state.user.profileImage} alt="image" />
          <b>{`${state.user.firstName} ${state.user.lastName}`}</b>
        </div>
        <div className='headSect'>
          <ThreeDotsVertical />
        </div>
      </header>
      <form id='chatSearch' onSubmit={(event) => getUsers(event)}>
        <input type="search" placeholder='Search Users Here . . .' ref={searchText} />
        <button type='submit'><SearchBs /></button>
      </form>
      <div className='chatUsersChats'>

        {isLoading ? <span className="loader"></span> :
          (!users || users.length == 0) ?
            <h1 className='searchUsers'>Search Users. . .</h1>
            :
            users.map((user, index) => (
              <SingleChatUser key={index} image={user.profileImage} userName={`${user.firstName} ${user.lastName}`} userId={user._id} userEmail={user.email} />
            ))
        }
      </div>
    </div>
  );
};

export default Chat;