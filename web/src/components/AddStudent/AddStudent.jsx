import React, { useRef, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import "./AddStudent.css"
import "../main.css"

import { CameraFill, ArrowLeft } from 'react-bootstrap-icons'

import { baseUrl } from "../../core.mjs"

const AddStudent = (props) => {

    const { setModal, getAllStudents } = props

    const [selectedImage, setSelectedImage] = useState()
    const [message, setMessage] = useState("")

    const firstNameRef = useRef()
    const lastNameRef = useRef()
    const passwordRef = useRef()
    const emailRef = useRef()
    const courseRef = useRef()
    const numberRef = useRef()
    const fileRef = useRef()

    const addStudent = async (event) => {
        event.preventDefault()

        if (
            firstNameRef.current.value.trim() === '' || lastNameRef.current.value.trim() === ''
            || passwordRef.current.value.trim() === '' || emailRef.current.value.trim() === ''
            || courseRef.current.value.trim() === '' || numberRef.current.value.trim() === ''
        ) {
            setMessage("Please fill required fields")
            return;
        }

        if (!fileRef.current.files) {
            setMessage("Please select an image")
            return;
        }

        let formData = new FormData();

        formData.append("firstName", firstNameRef.current.value);
        formData.append("lastName", lastNameRef.current.value);
        formData.append("password", passwordRef.current.value);
        formData.append("email", emailRef.current.value);
        formData.append("course", courseRef.current.value);
        formData.append("phoneNumber", numberRef.current.value);
        formData.append("files", fileRef.current.files[0])

        try {
            const response = await axios.post(`${baseUrl}/api/v1/add-student`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            // sweet alert toast
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 1200,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });
            Toast.fire({
                title: "Student Added"
            });

            event.target.reset()
            getAllStudents()

            setTimeout(() => {
                setModal(false)
            }, [1000])


        } catch (error) {
            console.error(error);
            setMessage("Error adding student")
        }

    }

    return (
        <form onSubmit={addStudent} className='addStudentForm text-[0.8em] flex flex-col justify-start items-center gap-[1em] bg-[#fff] text-[#353535] p-[3em] w-[40em] rounded-[10px]'>
            <div className='w-[100%] flex justify-between items-center gap-[1em]'>
                <div className='flex justify-start items-cneter gap-[1em]'>
                    <ArrowLeft className='cursor-pointer text-[2em]' onClick={() => setModal(false)} />
                    <h1 className='text-[2em]'>Add Student</h1>
                </div>
                <button className='text-[#fff] flex justify-center items-center gap-[1em] bg-[#0099ff] w-[5em] p-[0.5em] rounded-[5px]'>
                    <p>Add</p>
                </button>
            </div>
            <input ref={fileRef} type="file" required hidden id='profileImage' accept="image/*"
                onChange={(e) => {
                    const base64Url = URL.createObjectURL(e.target.files[0]);
                    setSelectedImage(base64Url);
                }}
            />
            <label className='cursor-pointer' htmlFor="profileImage">
                <img src={selectedImage} className='w-[8em] h-[8em] rounded-[100%] bg-[#0099ff]' />
                <CameraFill className='text-[1.5em]' />
            </label>
            <p className='text-center w-[80%]'>{message}</p>
            <div className='w-[100%] flex flex-wrap justify-center w-[40em] gap-[2em]'>
                <div className='flex flex-col gap-[1em]'>
                    <p>First Name</p>
                    <input required ref={firstNameRef} type="text" minLength={3} maxLength={12} className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Last Name</p>
                    <input required ref={lastNameRef} type="text" minLength={3} maxLength={12} className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Course</p>
                    <input required ref={courseRef} type="text" minLength={3} maxLength={12} className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Password</p>
                    <input required ref={passwordRef} type="text" minLength={4} maxLength={8} className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Email</p>
                    <input required ref={emailRef} type="email" className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Phone Number</p>
                    <input required ref={numberRef} type="number" className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
            </div>
        </form>
    )
}

export default AddStudent
