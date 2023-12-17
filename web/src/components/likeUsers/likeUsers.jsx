import './likeUsers.css';
import '../main.css'
import React, { useContext } from 'react';
import { GlobalContext } from '../../context/context';

import { baseUrl } from '../../core.mjs';
 
const LikeUsers = (props) => {

  let { state, dispatch } = useContext(GlobalContext);

  return (
    <div className='likeUsersCont' onClick={() => {props.getUser(props.userId)}} >
      <img src={props.profileImage} alt='profile image'/>
      <div>
      <h3 className='likeUserName'>{props.firstName} {props.lastName}</h3>
      <p className="seeUser bi bi-arrow-up-right-square" ></p>
      </div>
    </div>
  );

};

export default LikeUsers;