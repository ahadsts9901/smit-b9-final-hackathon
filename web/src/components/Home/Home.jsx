import React, { useContext, useState } from 'react'
import { GlobalContext } from "../../context/context";
import Modal from '../Modal/Modal';
import axios from 'axios';
import moment from 'moment';
import { baseUrl } from '../../core.mjs';


const Home = () => {

  const [showModal, setShowModal] = useState(false)
  const { state, dispatch } = useContext(GlobalContext);

  const timeElapsedSinceCheckIn = moment().diff(moment(state.user.checkInTime), 'hours')
  const isCheckedIn = state.user.checkInTime < state.user.checkOutTime;

  const logout = async () => {
    try {
      const resp = await axios.post(`${baseUrl}/api/v1/logout`)
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  }

  const checkOut = async () => {
    console.log("hi");
  }

  return (
    <>
      {
        showModal ? <Modal setShowModal={setShowModal} /> : null
      }
      <div className='homeMain bg-[#fff] w-[100vw] h-[100vh] flex flex-col justify-start gap-[1em] items-center p-[2em]'>
        <div className='flex justify-between items-center gap-[1em] w-[100%]'>
          <h1 className='text-[2em] text-left'>Hello {state.user.firstName}</h1>
          <img src={state.user.profileImage} className='w-[3em] h-[3em] rounded-[100%]' />
        </div>
        <div className='flex flex-col gap-[1em] w-[100%] pt-[2em]'>
          <p className='text-[1.2em] text-[#888]'>Id</p>
          <p className='text-[1.2em] text-[#353535]'>{state.user.userId.slice(-6)}</p>
          <p className='text-[1.2em] text-[#888]'>Course</p>
          <p className='text-[1.2em] text-[#353535]'>{state.user.course}</p>
          <p className='text-[1.2em] text-[#888]'>Check In Time</p>
          <p className='text-[1.2em] text-[#353535]'>{moment(state.user.checkInTime).fromNow() || "------------"}</p>
          <p className='text-[1.2em] text-[#888]'>Check Out Time</p>
          <p className='text-[1.2em] text-[#353535]'>{moment(state.user.checkOutTime).fromNow() || "------------"}</p>
        </div>
        {
          timeElapsedSinceCheckIn >= 23 ? (
            <button onClick={() => setShowModal(true)} type='submit' className='bg-[#0099ff] text-[#fff] p-[0.6em] rounded-[3px] w-[100%]'>
              Check In
            </button>
          ) : (
            <button onClick={checkOut} type='submit' className='bg-[#0099ff] text-[#fff] p-[0.6em] rounded-[3px] w-[100%]'>
              Check Out
            </button>
          )
        }
        <button onClick={logout} type='button' className='bg-[#0099ff] text-[#fff] p-[0.6em] rounded-[3px] w-[100%]'>Logout</button>
      </div>
    </>
  )
}

export default Home
