import React, { useState, useContext } from "react";
import "./secondaryChat.css";
import { ChevronDown, ChevronUp, TrashFill, PencilFill } from "react-bootstrap-icons";
import moment from "moment"
import { GlobalContext } from "../../../context/context";

import { baseUrl } from '../../../core.mjs';
 
const SecondaryChat = (props) => {

  let { state, dispatch } = useContext(GlobalContext);
  const time = moment(props.time).fromNow();

  const [showAction, setShowAction] = useState(false)

  return (
    <div className="mainMessage">
      <div className="otherMessageTail"></div>
      <div className="otherMessage">
        <p>{props.message}</p>
        {props.time ? (
          <span className="otherDetails">
            {state.user.userId === props.from_id ? (
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
            ) : null}
            <p id="chatTime">{time}</p>
          </span>
        ) : null}
        {state.user.userId === props.from_id ? (
          showAction ? (
            <div className="secondaryChatActionCont">
              <p className="pointer">
                <TrashFill /> Delete
              </p>
              <p className="pointer">
                <PencilFill /> Edit
              </p>
            </div>
          ) : null
        ) : null}
      </div>
    </div>
  );
  
};

export default SecondaryChat;