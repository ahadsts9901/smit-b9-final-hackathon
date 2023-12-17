import React
, { useState, useRef, useEffect, useContext }
  from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './notifications.css';
import '../main.css'
import { Link, useNavigate } from 'react-router-dom';
import { GlobalContext } from "../../context/context";
import { baseUrl } from '../../core.mjs';
import moment from "moment"
import { XLg } from "react-bootstrap-icons"

const Notifications = () => {

  let { state, dispatch } = useContext(GlobalContext);
  const [notifications, setNotifications] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    getNotifications()
  }, [])

  const getNotifications = async () => {

    try {

      const response = await axios.get(`${baseUrl}/api/v1/notifications?q=${state.user.userId}`,)

      // console.log(response.data);

      setNotifications(response.data)

    } catch (error) {
      console.log(error);
    }

  }

  const removeNotification = async (id) => {

    try {

      const delResp = await axios.delete(`${baseUrl}/api/v1/notification/${id}`)
      getNotifications()
      // console.log("deleted");

    } catch (error) {
      console.log(error);
    }

  }

  return (
    <div className='testNotifications'>
      {
        !notifications ? <span className='loader'></span> :
          notifications.length == 0 ?
            <h2 className='noNotification'>No Notification</h2>
            : notifications.map((notification) => (
              <div className='singleNotification'>
                <div className='notificationLeft' onClick={() => navigate(`/${notification.location}/${notification.action_id}`)}>
                  <img src={notification.senderImage} className='notifyImage' alt="image" />
                  <div className='notifyContent'>
                    <h4>{notification.senderName}</h4>
                    <p>{notification.content}</p>
                  </div>
                </div>
                <div className="notifyAct">
                  <p className='notifyTime'>{moment(notification.time).fromNow()}</p>
                  <XLg onClick={() => removeNotification(notification._id)} />
                </div>
              </div>
            ))
      }
    </div>
  )
};

export default Notifications;