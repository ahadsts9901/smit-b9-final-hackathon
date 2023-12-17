import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import axios from 'axios'
import { baseUrl } from "../../core.mjs"

import { ArrowLeft, Camera, CameraFill, ClipboardData, MortarboardFill, PencilFill, EyeFill, Person, PlusCircleFill, EyeSlashFill } from "react-bootstrap-icons"

import AddStudent from '../AddStudent/AddStudent'

import "./AdminPanel.css"
import "../main.css"
import EditStudent from '../EditStudent/EditStudent'

const AdminPanel = () => {

  const [modal, setModal] = useState(false)
  const [students, setStudents] = useState([])
  const [isEditStudent, setIsEditStudent] = useState(false)
  const [student, setStudent] = useState()
  const [showPass, setShowPass] = useState(false)

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

  const editStudent = async (studentId) => {

    setIsEditStudent(true)

    try {

      const resp = await axios.get(`${baseUrl}/api/v1/student/${studentId}`)
      setStudent(resp.data.data)

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
      {
        isEditStudent ? <EditStudent setIsEditStudent={setIsEditStudent} student={student} /> : null
      }
      {
        modal ? <AddStudent setModal={setModal} getAllStudents={getAllStudents} /> : null
      }
      <div className='mainAdminPanel flex gap-0 h-[100vh] w-[100vw]'>

        {/* left side */}
        <div className='w-[13em] h-[100%] flex flex-col justify-between items-center p-[2em] gap-[1em]'>
          <div className='flex flex-col items-center gap-[2em]'>
            <MortarboardFill className='text-[2em]' />
            <Link to={"/students"} className='text-[#353535] flex justify-start items-center gap-[0.5em] w-[100%]'>
              <span className='text-[#0099ff]  p-[0.5em] bg-[#f6f6f6] rounded-[100%]'>
                <Person />
              </span>
              <p className='text-[#212121]'>Students</p>
            </Link>
            <Link to={"/attendance"} className='text-[#353535] flex justify-start items-center gap-[0.5em] w-[100%]'>
              <span className='text-[#0099ff]  p-[0.5em] bg-[#f6f6f6] rounded-[100%]'>
                <ClipboardData />
              </span>
              <p className='text-[#888]'>Attendance</p>
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
              <h1 className='text-[2em]'>Students</h1>
            </div>
            <button onClick={() => setModal(true)} className='text-[#fff] flex justify-center items-center gap-[1em] bg-[#0099ff] w-[9em] p-[0.5em] rounded-[5px]'><PlusCircleFill /> <p>Add Student</p></button>
          </div>
          <div className='bg-[#0099ff] text-[#fff] w-[100%] px-[2.5em] py-[1.5em] rounded-[5px] flex items-center gap-[2.5em]'>
            <p className='w-[5em]'>Id</p>
            <p className='w-[7em]'>Profile Image</p>
            <p className='w-[8em]'>Name</p>
            <p className='w-[7em]'>Course Name</p>
            <p className='w-[6em]'>Password</p>
          </div>
          <div className='studentsCont w-[100%] flex flex-col gap-[1em] h-[100%]'>
            {
              students ? students.map((student, index) => (
                <div key={index} className='bg-[#fff] text-[#353535] w-[100%] px-[2.5em] py-[1.5em] rounded-[5px] flex items-center gap-[2.5em]'>
                  <p className='w-[5em]'>{student._id.slice(-6)}</p>
                  <div className='w-[7em] flex justify-center items-center'><img src={student.profileImage} className='w-[2em] h-[2em] object-cover rounded-[100%]' /></div>
                  <p className='w-[8em]'>{student.firstName} {student.lastName}</p>
                  <p className='w-[7em]'>{student.course}</p>
                  <input type={showPass ? "text" : "password"} className='w-[6em]' value={student.password} readOnly />
                  <PencilFill onClick={() => { editStudent(student._id) }} className='cursor-pointer' />
                  {
                    showPass ?
                      <EyeFill className='cursor-pointer' onClick={() => setShowPass(!showPass)} /> :
                      <EyeSlashFill className='cursor-pointer' onClick={() => setShowPass(!showPass)} />
                  }
                </div>
              )) : null
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminPanel
