import React, { useRef, useState } from 'react'
import "./AddStudent.css"
import "../main.css"

import { CameraFill, ArrowLeft } from 'react-bootstrap-icons'

const AddStudent = (props) => {

    const { setModal } = props

    const [selectedImage, setSelectedImage] = useState()

    const firstNameRef = useRef()
    const lastNameRef = useRef()
    const courseRef = useRef()
    const numberRef = useRef()
    const passwordRef = useRef()
    const emailRef = useRef()

    const addStudent = async (event) => {
        event.preventDefault()

    }

    return (
        <form onSubmit={addStudent} className='addStudentForm text-[0.8em] flex flex-col justify-start items-center gap-[1em] bg-[#fff] text-[#353535] p-[3em] w-[40em] rounded-[10px]'>
            <div className='w-[100%] flex justify-between items-center gap-[1em]'>
                <div className='flex justify-start items-cneter gap-[1em]'>
                    <ArrowLeft className='text-[2em]' />
                    <h1 className='text-[2em]'>Add Student</h1>
                </div>
                <button className='text-[#fff] flex justify-center items-center gap-[1em] bg-[#0099ff] w-[5em] p-[0.5em] rounded-[5px]'>
                    <p onClick={() => setModal(false)}>Add</p>
                </button>
            </div>
            <input type="file" hidden id='profileImage' accept="image/*"
                onChange={(e) => {
                    const base64Url = URL.createObjectURL(e.target.files[0]);
                    setSelectedImage(base64Url);
                }}
            />
            <label className='cursor-pointer' htmlFor="profileImage">
                <img src={selectedImage} className='w-[8em] h-[8em] rounded-[100%] bg-[#0099ff]' />
                <CameraFill className='text-[1.5em]' />
            </label>
            <div className='w-[100%] flex flex-wrap justify-center w-[40em] gap-[2em]'>
                <div className='flex flex-col gap-[1em]'>
                    <p>First Name</p>
                    <input ref={firstNameRef} type="text" minLength={3} maxLength={12} className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Last Name</p>
                    <input ref={lastNameRef} type="text" minLength={3} maxLength={12} className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Course</p>
                    <input ref={courseRef} type="text" minLength={3} maxLength={12} className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Password</p>
                    <input ref={passwordRef} type="text" minLength={4} maxLength={8} className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Email</p>
                    <input ref={emailRef} type="email" className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Phone Number</p>
                    <input ref={numberRef} type="number" className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
            </div>
        </form>
    )
}

export default AddStudent
