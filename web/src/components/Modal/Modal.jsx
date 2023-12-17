import React, { useRef, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import "./Modal.css";
import "../main.css";
import { CameraFill, ArrowLeft } from 'react-bootstrap-icons';
import { baseUrl } from "../../core.mjs";
import { GlobalContext } from "../../context/context";

const Modal = (props) => {

    const { state, dispatch } = useContext(GlobalContext);

    const selectedImageRef = useRef(null);
    const fileRef = useRef();
    const { setShowModal } = props;
    const [message, setMessage] = useState("")

    const checkIn = async (event) => {

        event.preventDefault()

        if (!fileRef.current.files) {
            setMessage("Please select your image")
            return;
        }

        let formData = new FormData();
        formData.append("files", fileRef.current.files[0])

        try {
            const response = await axios.put(`${baseUrl}/api/v1/check-in/${state.user.userId}`, formData, {
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
                title: "Check In Successfull"
            });

            event.target.reset()

            setTimeout(() => {
                setShowModal(false)
            }, [1000])


        } catch (error) {
            console.error(error);
            setMessage("Already Checked in, try later")
        }

    }

    return (
        <form onSubmit={checkIn} className='addStudentForm text-[0.8em] flex flex-col justify-start items-center gap-[1.5em] bg-[#fff] text-[#353535] p-[3em] w-[40em] rounded-[10px]'>
            <div className='w-[100%] flex justify-between items-center gap-[1em]'>
                <div className='flex justify-start items-cneter gap-[1em]'>
                    <ArrowLeft className='cursor-pointer text-[2em]' onClick={() => setShowModal(false)} />
                </div>
            </div>
            <input
                ref={fileRef}
                type="file"
                hidden
                id='profileImage'
                accept="image/*"
                onChange={(e) => {
                    const base64Url = URL.createObjectURL(e.target.files[0]);
                    selectedImageRef.current.src = base64Url;
                }}
            />
            <label className='cursor-pointer' htmlFor="profileImage">
                <img ref={selectedImageRef} className='w-[8em] h-[8em] rounded-[100%] bg-[#353535]' />
                <CameraFill className='text-[1.5em]' />
            </label>
            <p className='text-[#888] text-[1em]'>Upload Your Selfie</p>
            <p>{message}</p>
            <button className='text-[#fff] flex justify-center items-center gap-[1em] bg-[#0099ff] w-[100%] p-[0.5em] rounded-[5px]'>
                <p>Check In</p>
            </button>
        </form>
    );
};

export default Modal;
