import React, { useState, useRef, useContext, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../signup/signup.css";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logoDark.png";
import { GlobalContext } from "../../context/context";

import { baseUrl } from "../../core.mjs";

const ForgotPasswordComplete = () => {
  
  const location = useLocation();

  // const otp = location.state.otp;

  // useEffect(()=>{
  //   Swal.fire({
  //     // icon: "info",
  //     text: "Your OTP code dont share it",
  //     title: otp,
  //     showConfirmButton: true,
  //     confirmButtonColor: "#284352",
  //     confirmButtonText: "Ok",
  //   });
  // },[location.state.otp])

  let { state, dispatch } = useContext(GlobalContext);

  const [validationMessage, setValidationMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isShowPassword, setShowPassword] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const otpRef = useRef(null);

  const navigate = useNavigate();

  // Handle form submission
  const completeForgotPassword = async (event) => {
    event.preventDefault();

    // if (!emailRef.current.value.endsWith("@gmail.com")) {
    //   setValidationMessage("Invalid email address");
    //   setSuccessMessage("");
    //   return;
    // }

    if (
      emailRef.current.value.trim() === "" ||
      passwordRef.current.value.trim() === "" ||
      confirmPasswordRef.current.value.trim() === ""
    ) {
      setValidationMessage("Please fill required fields");
      setSuccessMessage("");
      return;
    }

    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      setValidationMessage("Passwords do not match");
      setSuccessMessage("");
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/forgot-password-complete`,
        {
          email: emailRef.current.value,
          otpCode: otpRef.current.value,
          newPassword: passwordRef.current.value,
        }
      );

      // console.log("resp: ", response.data.message);

      setSuccessMessage("Password Updated Successfully");

      setTimeout(() => {
        navigate(
          "/login"
          // , { state: {
          //   email: emailRef.current.value,
          //   password: passwordRef.current.value
          //  }}
        );
      }, 1200);
    } catch (error) {
      console.log(error);
      setSuccessMessage("");
      setValidationMessage("Invalid OTP");
    }
  };

  return (
    <div className="authContainer">
      <h3 className="desktopHeading center">
        Forgot
        <br />
        Password
      </h3>
      <div className="logoCont">
        <img src={logo} className="logo" alt="logo" />
        <h1 className="line">
          <span className="black">We</span>
          <span> App</span>
        </h1>
        <p>Make Your Own</p>
        <p className="leftLogo">
          <Link to="/login" className="center">
            Login
          </Link>
          <Link to="/signup" className="center">
            Signup
          </Link>
        </p>
      </div>
      <form
        className="login c jcc ais login-signup"
        onSubmit={completeForgotPassword}
      >
        <div className="topHeading">
          <h2 className="center mobileHeading">
            Forgot
            <br />
            Password
          </h2>
        </div>
        <input
          required
          id="email-login"
          type="email"
          className="input"
          placeholder="example@gmail.com"
          value={location.state.email}
          ref={emailRef}
          disabled
        />
        <div className="r jcsb aic pass">
          <input
            ref={passwordRef}
            required
            type={isShowPassword ? "text" : "password"}
            className="input"
            placeholder="New Password"
            minLength="4"
            maxLength="8"
          />
          <i
            className={`bi ${isShowPassword ? "bi-eye" : "bi-eye-slash"}`}
            onClick={() => setShowPassword(!isShowPassword)}
          ></i>
        </div>
        <div className="r jcsb aic pass">
          <input
            ref={confirmPasswordRef}
            required
            type={isShowPassword ? "text" : "password"}
            className="input"
            placeholder="Repeat Password"
            minLength="4"
            maxLength="8"
          />
          <i
            className={`bi ${isShowPassword ? "bi-eye" : "bi-eye-slash"}`}
            onClick={() => setShowPassword(!isShowPassword)}
          />
        </div>
        {/* <p className='otpIns'>Enter 6 digit code we've sent to {location.state.email}</p> */}
        <input
          ref={otpRef}
          required
          type="number"
          className="input"
          placeholder="Enter 6 Digit Code"
          minLength="6"
          maxLength="6"
          // value={location.state.otp}
        />
        <p className="validationMessage">{validationMessage}</p>
        <p className="successMessage">{successMessage}</p>
        <button type="submit" className="button">
          Update Password
        </button>
        <div className="last forgotWhite">
          <p className="center">
            <Link to="/login" className="center">
              Login
            </Link>
            <Link to="/signup" className="center">
              Signup
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordComplete;
