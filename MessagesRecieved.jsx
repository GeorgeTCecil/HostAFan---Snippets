import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { formatDateTime } from "../../services/dateService";

const MessagesRecieved = (props) => {
  return (
    <div className="chat-item p-2 mb-2" id={props.message.id}>
      <div className="align-box-row">
        <div className="avatar-icon-wrapper avatar-icon-lg align-self-start">
          <div className="avatar-icon rounded border-0">
            <img alt="..." src={props.message.sender.avatarUrl} />
          </div>
        </div>
        <div>
          <div className="chat-box bg-first text-white">
            <p>{props.message.content}</p>
          </div>
          <small className="mt-2 d-block text-black-50">
            <FontAwesomeIcon
              icon={["far", "clock"]}
              className="mr-1 opacity-5"
            />
            {formatDateTime(props.message.dateCreated)}
          </small>
        </div>
      </div>
    </div>
  );
};

MessagesRecieved.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number,
    content: PropTypes.string,
    dateCreated: PropTypes.date,
    sender: PropTypes.shape({
      avatarUrl: PropTypes.string,
      name: PropTypes.string,
    }),
  }),
};

export default MessagesRecieved;
