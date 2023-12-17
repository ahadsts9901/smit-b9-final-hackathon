import React, { useRef, useState, useContext } from 'react'
import axios from 'axios'
import { MortarboardFill } from "react-bootstrap-icons"
import { baseUrl } from '../../core.mjs'

import "../main.css"
import "./Login.css"
import { useNavigate } from 'react-router-dom'

import { GlobalContext } from '../../context/context'

const Login = () => {

  const { state, dispatch } = useContext(GlobalContext);

  const [message, setMessage] = useState("")

  const loginEmailRef = useRef()
  const loginPasswordRef = useRef()

  const navigate = useNavigate()

  const login = async (event) => {

    event.preventDefault()

    if (loginEmailRef.current.value.trim() === '' || loginPasswordRef.current.value.trim() === '') {
      setMessage("Please enter required fields")
      return;
    }

    try {

      const response = await axios.post(`${baseUrl}/api/v1/login`, {
        email: loginEmailRef.current.value,
        password: loginPasswordRef.current.value
      }, {
        withCredentials: true
      })

      dispatch({
        type: "USER_LOGIN",
        payload: response.data.data,
      });

      setMessage("Login successful")

    } catch (error) {
      console.error(error);
      setMessage("Email or password incorrect")
    }

  }

  return (
    <form onSubmit={login} className='loginMain flex flex-col justify-center items-center gap-[1em] rounded-[5px] bg-[#fff] p-[1em]'>
      <MortarboardFill className='text-[2.5em] text-[#353535]' />
      <input required ref={loginEmailRef} type="email" placeholder='Email' className='bg-[#f6f6f6] text-[#353535] p-[0.6em] rounded-[3px] w-[100%]' />
      <input required ref={loginPasswordRef} type="password" placeholder='Password' className='bg-[#f6f6f6] text-[#353535] p-[0.6em] rounded-[3px] w-[100%]' />
      <p className='w-[90%] text-center text-[#353535]'>{message}</p>
      <button type='submit' className='bg-[#0099ff] text-[#fff] p-[0.6em] rounded-[3px] w-[100%]'>Login</button>
    </form>
  )
}

export default Login
