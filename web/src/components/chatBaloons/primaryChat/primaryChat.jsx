import React, { useState, useContext } from "react";
import "./primaryChat.css";
import { ChevronDown, PencilFill, TrashFill, ChevronUp } from "react-bootstrap-icons";
import moment from "moment"
import { GlobalContext } from "../../../context/context";

import { baseUrl } from '../../../core.mjs';

const PrimaryChat = (props) => {

  let { state, dispatch } = useContext(GlobalContext);
  const time = moment(props.time).fromNow();

  const [showAction, setShowAction] = useState(false)

  return (
    <div className="message">
      <div className="userMessage">
        <p>{props.message}</p>
        {props.time && (
          <span className="messageDetails">
            <p id="chatTime">{time}</p>
            {state.user.userId === props.from_id && (
              showAction ? (
                <ChevronUp className="pointer"
                  onClick={() => {
                    setShowAction(!showAction);
                  }}
                  style={{ marginTop: "0.3em" }}
                />
              ) : (
                <ChevronDown className="pointer"
                  onClick={() => {
                    setShowAction(!showAction);
                  }}
                  style={{ marginTop: "0.3em" }}
                />
              )
            )}
          </span>
        )}
        {state.user.userId === props.from_id && (
          showAction ? (
            <div className="chatActionCont">
              <span className="pointer" onClick={() => { props.del(props._id) }}> <TrashFill /> Delete</span>
              <span className="pointer" onClick={(event) => { props.edit(props._id, event) }}> <PencilFill /> Edit</span>
            </div>
          ) : null
        )}
      </div>
      <div className="messageTail"></div>
    </div>
  );

};

export default PrimaryChat