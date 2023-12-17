import React, { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import "./EditStudent.css"
import "../main.css"

import { CameraFill, ArrowLeft } from 'react-bootstrap-icons'

import { baseUrl } from "../../core.mjs"

const EditStudent = (props) => {

    const { setIsEditStudent, getAllStudents, student } = props

    useEffect(() => {
        setFirstNameRef(student?.firstName || '');
        setLastNameRef(student?.lastName || '');
        setCourseRef(student?.course || '');
        setPasswordRef(student?.password || '');
        setEmailRef(student?.email || '');
        setPhoneNumberRef(student?.phoneNumber || '');
    }, [student]);

    const [selectedImage, setSelectedImage] = useState()
    const [message, setMessage] = useState("")

    const [firstNameRef, setFirstNameRef] = useState(student?.firstName)
    const [lastNameRef, setLastNameRef] = useState(student?.firstName)
    const [emailRef, setEmailRef] = useState(student?.firstName)
    const [passwordRef, setPasswordRef] = useState(student?.firstName)
    const [courseRef, setCourseRef] = useState(student?.firstName)
    const [phoneNumberRef, setPhoneNumberRef] = useState(student?.firstName)

    const fileRef = useRef()

    const editStudent = async (event) => {
        event.preventDefault()

        if (
            firstNameRef.trim() === '' || lastNameRef.trim() === ''
            || passwordRef.trim() === '' || emailRef.trim() === ''
            || courseRef.trim() === '' || phoneNumberRef.trim() === ''
        ) {
            setMessage("Please fill required fields")
            return;
        }

        if (!fileRef.current.files) {
            setMessage("Please select an image")
            return;
        }

        let formData = new FormData();

        formData.append("firstName", firstNameRef);
        formData.append("lastName", lastNameRef);
        formData.append("password", passwordRef);
        formData.append("email", emailRef);
        formData.append("course", courseRef);
        formData.append("phoneNumber", phoneNumberRef);
        formData.append("files", fileRef.current.files[0])

        try {
            
            const response = await axios.put(`${baseUrl}/api/v1/student/${student?._id}`, formData, {
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
                title: "Student Edited"
            });

            event.target.reset()
            getAllStudents()
            setIsEditStudent(false)

        } catch (error) {
            console.error(error);
            setMessage("Error adding student")
        }

    }

    return (
        <form onSubmit={editStudent} className='addStudentForm text-[0.8em] flex flex-col justify-start items-center gap-[1em] bg-[#fff] text-[#353535] p-[3em] w-[40em] rounded-[10px]'>
            <div className='w-[100%] flex justify-between items-center gap-[1em]'>
                <div className='flex justify-start items-cneter gap-[1em]'>
                    <ArrowLeft className='cursor-pointer text-[2em]' onClick={() => setIsEditStudent(false)} />
                    <h1 className='text-[2em]'>Edit Student</h1>
                </div>
                <button className='text-[#fff] flex justify-center items-center gap-[1em] bg-[#0099ff] w-[5em] p-[0.5em] rounded-[5px]'>
                    <p>Edit</p>
                </button>
            </div>
            <input ref={fileRef} type="file" hidden id='profileImage' accept="image/*"
                onChange={(e) => {
                    const base64Url = URL.createObjectURL(e.target.files[0]);
                    setSelectedImage(base64Url);
                }}
            />
            <label className='cursor-pointer' htmlFor="profileImage">
                <img src={selectedImage || student?.profileImage} className='w-[8em] h-[8em] rounded-[100%] bg-[#0099ff]' />
                <CameraFill className='text-[1.5em]' />
            </label>
            <p className='text-center w-[80%]'>{message}</p>
            <div className='w-[100%] flex flex-wrap justify-center w-[40em] gap-[2em]'>
                <div className='flex flex-col gap-[1em]'>
                    <p>First Name</p>
                    <input onChange={(event) => setFirstNameRef(event.target.value)} value={firstNameRef} required type="text" minLength={3} maxLength={12} className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Last Name</p>
                    <input onChange={(event) => setLastNameRef(event.target.value)} value={lastNameRef} required type="text" minLength={3} maxLength={12} className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Course</p>
                    <input onChange={(event) => setCourseRef(event.target.value)} value={courseRef} required type="text" minLength={3} maxLength={12} className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Password</p>
                    <input onChange={(event) => setPasswordRef(event.target.value)} value={passwordRef} required type="text" minLength={4} maxLength={8} className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Email</p>
                    <input onChange={(event) => setEmailRef(event.target.value)} value={emailRef} required type="email" className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
                <div className='flex flex-col gap-[1em]'>
                    <p>Phone Number</p>
                    <input onChange={(event) => setPhoneNumberRef(event.target.value)} value={phoneNumberRef} required type="number" className='addStudentInputs p-[0.8em] rounded-[10px] border-[#ccc] border-[1px]' />
                </div>
            </div>
        </form>
    )
}

export default EditStudent
