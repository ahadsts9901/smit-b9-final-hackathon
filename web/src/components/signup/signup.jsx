import React, { useState, useRef, useContext } from 'react';
import axios from 'axios';
// import Swal from 'sweetalert2';
import '../signup/signup.css';
import { Link } from 'react-router-dom';
import logo from "../assets/logoDark.png"
import { GlobalContext } from "../../context/context"

import { baseUrl } from '../../core.mjs';
 
const Signup = () => {

  const { state, dispatch } = useContext(GlobalContext);

  const [validationMessage, setValidationMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // const navigate = useNavigate()

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Handle form submission
  const signup = async (event) => {
    event.preventDefault();

    const firstName = firstNameRef.current.value;
    const lastName = lastNameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;

    // if (!email.endsWith("@gmail.com")) {
    //   setValidationMessage("Invalid email address");
    //   setSuccessMessage("")
    //   return;
    // }

    if (
      firstName.trim() === '' ||
      lastName.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === ''
    ) {
      setValidationMessage("Please fill required fields");
      setSuccessMessage("")
      return;
    }

    if (password !== confirmPassword) {
      setValidationMessage("Passwords do not match");
      setSuccessMessage("")
      return;
    }

    try {
      const response = await axios.post(`${baseUrl}/api/v1/signup`, {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
        {
          withCredentials: true,
        });;

      setValidationMessage("");
      setSuccessMessage("Signup Successfull")

      dispatch({
        type: "USER_LOGIN",
        payload: response.data.data,
      });

      // navigate('/');
      window.location.pathname = "/";
    } catch (error) {
      console.log(error);
      setValidationMessage('User Already Exists');
      setSuccessMessage("")
    }


    // Reset the input fields after successful signup
    firstNameRef.current.value = '';
    lastNameRef.current.value = '';
    emailRef.current.value = '';
    passwordRef.current.value = '';
    confirmPasswordRef.current.value = '';
  };

  return (
    <div className='authContainer'>
      <h3 className="desktopHeading center">Create<br />Account</h3>
      <div className='logoCont'>
        <img src={logo} className='logo' alt="logo" />
        <h1 className='line'><span className='black'>We</span><span> App</span></h1>
        <p>Make Your Own</p>
        <p className="leftLogo">
          Already have an account?{" "}
          <Link to="/login" className="center">
            Login
          </Link>
        </p>
      </div>
      <form className="c jcc ais login-signup" onSubmit={signup}>
        <div className='topHeading'>
          <h2 className="center mobileHeading">Create<br />Account</h2>
        </div>
        <input
          ref={firstNameRef}
          required
          type="text"
          className="input"
          placeholder="First Name"
          minLength={3}
          maxLength={10}
        />
        <input
          ref={lastNameRef}
          required
          type="text"
          className="input"
          placeholder="Last Name"
          minLength={3}
          maxLength={10}
        />
        <input
          ref={emailRef}
          required
          type="email"
          className="input"
          placeholder="example@gmail.com"
        />
        <div className="r jcsb aic pass">
          <input
            ref={passwordRef}
            required
            type={isPasswordVisible ? "text" : "password"}
            className="input"
            placeholder="Password"
            minLength="4"
            maxLength="8"
          />
          <i
            className={`bi ${isPasswordVisible ? "bi-eye" : "bi-eye-slash"}`}
            onClick={togglePasswordVisibility}
          />
        </div>
        <div className="r jcsb aic pass">
          <input
            ref={confirmPasswordRef}
            required
            type={isPasswordVisible ? "text" : "password"}
            className="input"
            placeholder="Password"
            minLength="4"
            maxLength="8"
          />
          <i
            className={`bi ${isPasswordVisible ? "bi-eye" : "bi-eye-slash"}`}
            onClick={togglePasswordVisibility}
          />
        </div>
        <p className="validationMessage">{validationMessage}</p>
        <p className="successMessage">{successMessage}</p>
        <button type="submit" className="button">
          Sign Up
        </button>
        <div className="last">
          <p className="center">
            Already have an account?{" "}
            <Link to="/login" className="center">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;