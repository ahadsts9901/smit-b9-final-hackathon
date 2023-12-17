import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './unAuthProfile.css';
import { UserPost } from '../userPost/userPost';
import { useNavigate, useParams } from 'react-router-dom';
import { GlobalContext } from '../../context/context';
import { PencilFill } from 'react-bootstrap-icons'

import { baseUrl } from '../../core.mjs';
 
const UnAuthProfile = () => {

  let { state, dispatch } = useContext(GlobalContext);

  const [profile, setProfile] = useState()

  const { userId } = useParams();
;


  useEffect(() => {
    getAllPost();
    getProfile();

    return () => {
      // cleanup function
    };
  }, []);

  return (
    <div className='posts'>

      <div className="profile">
        <img className='profileIMG' src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" />

        <h2 className='profileName'>  <PencilFill className='editName' /> </h2>

        <button className='logOutButton' onClick={logOut}>Log Out</button>
        <div className='profileImageContainer'>
          <label className='editIMG' htmlFor="profileImage"><PencilFill /></label>
          <input type="file" className="file hidden" id="profileImage" accept="image/*"></input>
        </div>
      </div>

      {/* <div className="result">
        {!userPosts ? <h2 className="noPostMessage">No Post Found</h2> : (userPosts.length === 0 ? (
          <div className="loadContainer"><span class="loader"></span></div>
        ) : (
          userPosts.map((post, index) => (
            <UserPost key={index} title={post.title} text={post.text} time={post.time} postId={post._id} del={deletePost} edit={editPost} />
          ))
        ))}
      </div> */}
    </div>
  );
};

export default UnAuthProfile