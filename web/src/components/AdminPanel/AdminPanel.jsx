import React, { useState } from 'react'
import { Link } from "react-router-dom"

import { ArrowLeft, Camera, CameraFill, ClipboardData, MortarboardFill, Person, PlusCircleFill } from "react-bootstrap-icons"

import AddStudent from '../AddStudent/AddStudent'

import "../main.css"

const AdminPanel = () => {

  const [modal, setModal] = useState(false)

  return (
    <>
    {
      modal ? <AddStudent setModal={setModal}/> : null
    }
      <div className='mainAdminPanel flex gap-0 h-[100vh] w-[100vw]'>

        {/* left side */}
        <div className='w-[13em] h-[100%] flex flex-col justify-between items-center p-[2em] gap-[1em]'>
          <div className='flex flex-col items-center gap-[2em]'>
            <MortarboardFill className='text-[2em]' />
            <Link to={"/all-students"} className='text-[#353535] flex justify-start items-center gap-[0.5em] w-[100%]'>
              <span className='text-[#0099ff]  p-[0.5em] bg-[#f6f6f6] rounded-[100%]'>
                <Person />
              </span>
              <p>Students</p>
            </Link>
            <Link to={"/attendance"} className='text-[#353535] flex justify-start items-center gap-[0.5em] w-[100%]'>
              <span className='text-[#0099ff]  p-[0.5em] bg-[#f6f6f6] rounded-[100%]'>
                <ClipboardData />
              </span>
              <p>Attendance</p>
            </Link>
          </div>
          <p className='text-left w-[100%] mt-[auto] text-[1.2em]'>Logout</p>
        </div>

        {/* right side */}
        <div className='flex flex-col bg-[#f6f6f6] justify-start items-start gap-[2em] p-[2em] w-[100%]'>
          <div className='w-[100%] flex justify-between items-start w-[100%]'>
            <div className='flex justify-start items-center gap-[1em]'>
              <span className='text-[1.8em] text-[#fff] bg-[#0099ff] rounded-[100%] p-[0.5em]'>
                <Person />
              </span>
              <h1 className='text-[2em]'>Students</h1>
            </div>
            <button onClick={() => setModal(true)} className='text-[#fff] flex justify-center items-center gap-[1em] bg-[#0099ff] w-[9em] p-[0.5em] rounded-[5px]'><PlusCircleFill /> <p>Add Student</p></button>
          </div>
          <div className='bg-[#0099ff] text-[#fff] w-[100%] px-[2.5em] py-[1.5em] rounded-[5px] flex items-center gap-[2.5em]'>
            <p>Id</p>
            <p>Profile Image</p>
            <p>Name</p>
            <p>Course Name</p>
            <p>Password</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminPanel
