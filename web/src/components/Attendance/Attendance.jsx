import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import axios from 'axios'
import { baseUrl } from "../../core.mjs"
import moment from 'moment'

import { ClipboardData, MortarboardFill, Person, PlusCircleFill } from "react-bootstrap-icons"

import "./Attendance.css"
import "../main.css"

const Attendance = () => {

  const [students, setStudents] = useState()

  useEffect(() => {
    getAllStudents()
  }, [])

  const getAllStudents = async () => {

    try {

      const response = await axios.get(`${baseUrl}/api/v1/students`)
      setStudents(response.data.data)

    } catch (error) {
      console.log(error);
    }

  }

  const logout = async () => {
    try {
      const resp = await axios.post(`${baseUrl}/api/v1/logout`)
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className='mainAdminPanel flex gap-0 h-[100vh] w-[100vw]'>

        {/* left side */}
        <div className='w-[13em] h-[100%] flex flex-col justify-between items-center p-[2em] gap-[1em]'>
          <div className='flex flex-col items-center gap-[2em]'>
            <MortarboardFill className='text-[2em]' />
            <Link to={"/students"} className='text-[#353535] flex justify-start items-center gap-[0.5em] w-[100%]'>
              <span className='text-[#0099ff]  p-[0.5em] bg-[#f6f6f6] rounded-[100%]'>
                <Person />
              </span>
              <p className='text-[#888]'>Students</p>
            </Link>
            <Link to={"/attendance"} className='text-[#353535] flex justify-start items-center gap-[0.5em] w-[100%]'>
              <span className='text-[#0099ff]  p-[0.5em] bg-[#f6f6f6] rounded-[100%]'>
                <ClipboardData />
              </span>
              <p className='text-[#212121]'>Attendance</p>
            </Link>
          </div>
          <p className='text-left w-[100%] mt-[auto] text-[1.2em] cursor-pointer' onClick={logout}>Logout</p>
        </div>

        {/* right side */}
        <div className='flex flex-col bg-[#f6f6f6] justify-start items-start gap-[2em] p-[2em] w-[100%]'>
          <div className='w-[100%] flex justify-between items-start w-[100%]'>
            <div className='flex justify-start items-center gap-[1em]'>
              <span className='text-[1.8em] text-[#fff] bg-[#0099ff] rounded-[100%] p-[0.5em]'>
                <Person />
              </span>
              <h1 className='text-[2em]'>Attendance</h1>
            </div>
          </div>
          <div className='bg-[#0099ff] text-[#fff] w-[100%] px-[2.5em] py-[1.5em] rounded-[5px] flex items-center gap-[2.5em]'>
            <p className='w-[5em]'>Id</p>
            <p className='w-[7em]'>Profile Image</p>
            <p className='w-[8em]'>Name</p>
            <p className='w-[10em]'>Checked In Time</p>
            <p>Checked Out Time</p>
          </div>
          <div className='studentsCont w-[100%] flex flex-col gap-[1em] h-[100%]'>
            {
              students ? students.map((student) => (
                <div className='bg-[#fff] text-[#353535] w-[100%] px-[2.5em] py-[1.5em] rounded-[5px] flex items-center gap-[2.5em]'>
                  <p className='w-[5em]'>{student._id.slice(-6)}</p>
                  <div className='w-[7em] flex justify-center items-center'><img src={student.profileImage} className='w-[2em] h-[2em] object-cover rounded-[100%]' /></div>
                  <p className='w-[8em]'>{student.firstName} {student.lastName}</p>
                  <p className='w-[10em]'>{moment(student.checkInTime).fromNow()}</p>
                  <p>{moment(student.checkOutTime).fromNow()}</p>
                </div>
              )) : null
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default Attendance
