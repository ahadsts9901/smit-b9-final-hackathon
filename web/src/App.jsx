import Home from "./components/home/home";
import Signup from "./components/signup/signup.jsx";
import Login from "./components/login/login.jsx";
import Chat from "./components/chat/chat.jsx";
import Search from "./components/search/search.jsx";
import Games from "./components/games/games.jsx";
import Notifications from "./components/notifications/notifications.jsx";
import Create from "./components/create/create.jsx";
import Profile from "./components/profile/profile.jsx";
import Navbar from "./components/navbar/navbar";
import Admin from "./components/admin/admin";
import UnAuthNavbar from "./components/unAuthNavbar/unAuthNavbar";
import SinglePost from "./components/singlePost/singlePost";
import PostLikes from "./components/postLikes/postLikes";
import ChatScreen from "./components/chatScreen/chatScreen";
import CommentLikes from "./components/commentLikes/commentLikes";

import { useEffect, useContext, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { GlobalContext } from "./context/context";

import "./App.css";
import logo from "./components/assets/logoDark.png";
import axios from "axios";
import io from "socket.io-client";

import { baseUrl } from "./core.mjs";
import ForgotPassword from "./components/forgotPassword/forgotPassword.jsx";
import ForgotPasswordComplete from "./components/forgotPasswordComplete/forgotPasswordComplete.jsx";

const App = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const [notifications, setNotifications] = useState([]);

  const location = useLocation();

  useEffect(() => {
    const socket = io(baseUrl, {
      secure: true,
      withCredentials: true,
    });

    socket.on("connect", function () {
      // console.log("connected in app.jsx");
    });
    socket.on("disconnect", function (message) {
      // console.log("Socket disconnected from server: ", message);
    });

    socket.on(`NOTIFICATIONS`, (e) => {
      const location = window.location.pathname;

      // console.log("new item from server: ", location);

      if (!location.includes("chat")) {
        setNotifications((prev) => {
          return [e, ...prev];
        });
      }

      setTimeout(() => {
        setNotifications([])
      }, 5000)

    });

    return () => {
      socket.close();
    };
  }, [state]);

  useEffect(() => {
    axios.interceptors.request.use(
      function (config) {
        config.withCredentials = true;
        return config;
      },
      function (error) {
        // Do something with request error
        return Promise.reject(error);
      }
    );

    return () => {
      // cleanup function
    };
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const resp = await axios.get(`${baseUrl}/api/v1/ping`, {
          withCredentials: true,
        });
        dispatch({
          type: "USER_LOGIN",
          payload: resp.data.data,
        });
      } catch (err) {
        console.error(err);
        dispatch({
          type: "USER_LOGOUT",
        });
      }
    };

    checkLoginStatus();

    return () => {
      // cleanup function
    };
  }, []);

  const isSearchOrChatRoute =
    location.pathname === "/search" ||
    window.location.pathname.startsWith("/chat") ||
    location.pathname === "/search/" ||
    window.location.pathname.startsWith("/chat/") ||
    window.location.pathname.startsWith("/games") ||
    window.location.pathname.startsWith("/games/");

  return (
    <div className="div">
      {/* <div>{JSON.stringify(state)}</div> */}
      {/* {console.log(state)} */}
      {/* user routes */}
      {state.isLogin === true && state.user.isAdmin === false ? (
        <>
          {isSearchOrChatRoute ? null : <Navbar />}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:userParamsId" element={<Profile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:userId" element={<ChatScreen />} />
            <Route path="/search" element={<Search />} />
            <Route path="/create" element={<Create />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/games" element={<Games />} />
            <Route path="/post/:postId" element={<SinglePost />} />
            <Route path="/likes/post/:postId" element={<PostLikes />} />
            <Route
              path="/likes/comment/:commentId"
              element={<CommentLikes />}
            />
            <Route path="*" element={<Navigate to="/" replace={true} />} />
          </Routes>
        </>
      ) : null}

      {state.isLogin === true && state.user.isAdmin === true ? (
        <>
          {isSearchOrChatRoute ? null : <Navbar />}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:userParamsId" element={<Profile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:userId" element={<ChatScreen />} />
            <Route path="/search" element={<Search />} />
            <Route path="/create" element={<Create />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/games" element={<Games />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/post/:postId" element={<SinglePost />} />
            <Route path="/likes/post/:postId" element={<PostLikes />} />
            <Route
              path="/likes/comment/:commentId"
              element={<CommentLikes />}
            />
            <Route path="*" element={<Navigate to="/" replace={true} />} />
          </Routes>
        </>
      ) : null}

      {/* unAuth routes */}

      {state.isLogin === false ? (
        <>
          {window.location.pathname.startsWith("/profile") ||
            window.location.pathname.startsWith("/post") ||
            window.location.pathname.startsWith("/likes") ? (
            <UnAuthNavbar />
          ) : null}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* un Auth Routes */}

            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/profile/:userParamsId" element={<Profile />} />
            <Route path="/post/:postId" element={<SinglePost />} />
            <Route path="/likes/post/:postId" element={<PostLikes />} />
            <Route
              path="/likes/comment/:commentId"
              element={<CommentLikes />}
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/forgot-password-complete"
              element={<ForgotPasswordComplete />}
            />

            <Route path="*" element={<Navigate to="/login" replace={true} />} />
          </Routes>
        </>
      ) : null}

      {/* splash screen */}
      {state.isLogin === null ? (
        <>
          <div className="splashCont">
            <img src={logo} className="splash"></img>
            <h1 className="line">
              <span className="black">We</span>
              <span> App</span>
            </h1>
            <p>Make Your Own</p>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default App;
