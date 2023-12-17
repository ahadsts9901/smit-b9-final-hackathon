import React, { useState, useRef, useContext } from "react";
import axios from "axios";
// import Swal from 'sweetalert2';
import "../signup/signup.css";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logoDark.png";
import { GlobalContext } from "../../context/context";

import { baseUrl } from "../../core.mjs";

const ForgotPassword = () => {
  const navigate = useNavigate();

  let { state, dispatch } = useContext(GlobalContext);

  const [email, setEmail] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  const passwordRef = useRef(null);

  // const navigate = useNavigate()

  // Handle form submission
  const forgotPassword = async (event) => {
    event.preventDefault();

    // if (!email.endsWith("@gmail.com")) {
    //   setValidationMessage("Invalid email address");
    //   return;
    // }

    if (email.trim() === "") {
      setValidationMessage("Please enter email");
      return;
    }

    try {
      const response = await axios.post(`${baseUrl}/api/v1/forgot-password`, {
        email: email,
      });

      navigate("/forgot-password-complete", {
        state: { email: email },
      });
      
    } catch (error) {
      console.error(error);
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
      <form className="login c jcc ais login-signup" onSubmit={forgotPassword}>
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
          placeholder="Enter Account Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="validationMessage">{validationMessage}</p>
        <button type="submit" className="button">
          Next
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

export default ForgotPassword;
