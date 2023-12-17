import { ChatDots, House, HouseFill, Person, PersonFill, Controller, Search as SearchBS, Bell, BellFill, PlusCircle, PlusCircleFill, PersonLock, PersonFillLock } from 'react-bootstrap-icons';
import { useContext } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { GlobalContext } from '../../context/context';
import './navbar.css';
// import logo from '../assets/logoDark.png';
import axios from 'axios';

import { baseUrl } from '../../core.mjs';

const Navbar = () => {
    const { state, dispatch } = useContext(GlobalContext);

    const location = useLocation();

    const { userParamsId } = useParams()

    const isAdmin = state.user.isAdmin

    return (
        <div className="navBar">
            <div className="navbarTop">
                <h1>
                    <span>WE</span>
                    <span className="black"> App</span>
                </h1>
                <div>
                    <Link to={`/search`}>
                        <SearchBS className="navIcons" />
                    </Link>
                    <Link to={`/chat`}>
                        <ChatDots className="navIcons" />
                    </Link>
                    {state.user.isAdmin === true ?

                        <Link to={`/admin`}>
                            {location.pathname === '/admin' || location.pathname === '/admin/' ? (
                                <PersonFillLock className="navIcons" />
                            ) : (
                                <PersonLock className="navIcons" />
                            )}
                        </Link>

                        // <Link to={`/admin`}>
                        //     <PersonLinesFill className="navIcons" />
                        // </Link> 


                        : null}
                </div>
            </div>
            <div className="navbarBottom">
                <Link to="/">
                    {location.pathname === '/' ? (
                        <HouseFill className="navIcons active" />
                    ) : (
                        <House className="navIcons" />
                    )}
                </Link>
                <Link to="/games">
                    {location.pathname === '/games' || location.pathname === '/games/' ? (
                        <Controller className="navIcons active" />
                    ) : (
                        <Controller className="navIcons" />
                    )}
                </Link>
                <Link to="/create">
                    {location.pathname === '/create' || location.pathname === '/create/' ? (
                        <PlusCircleFill className="add active" />
                    ) : (
                        <PlusCircle className="add" />
                    )}
                </Link>
                <Link to="/notifications">
                    {location.pathname === '/notifications' || location.pathname === '/notifications/' ? (
                        <BellFill className="navIcons active" />
                    ) : (
                        <Bell className="navIcons" />
                    )}
                </Link>
                <Link to={`/profile/${state.user.userId}`}>
                    {location.pathname.startsWith('/profile') ? (
                        <img src={state.user.profileImage} className="navImg imgNavAct" />
                    ) : (
                        <img src={state.user.profileImage} className="navImg" />
                    )}
                </Link>
            </div>
        </div>
    );
};

export default Navbar;