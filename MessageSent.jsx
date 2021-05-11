import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { formatDateTime } from "../../services/dateService";
import { Button } from "@material-ui/core";

const MessageSent = (props) => {
  const [showSenderOptions, setOptions] = useState(false);
  const aMessage = props.message;

  const handleShowEdit = () => {
    props.handleShowEdit(aMessage);
  };

  const handleDeleteContent = () => {
    props.handleDeleteContent(aMessage.id);
  };

  const handleShowSenderOptions = () => {
    setOptions(!showSenderOptions);
  };

  return (
    <div
      className="chat-item chat-item-reverse p-2 mb-2"
      name={props.message.content}
      id={props.message.id}
    >
      <div
        className="align-box-row flex-row-reverse"
        onMouseEnter={handleShowSenderOptions}
        onMouseLeave={handleShowSenderOptions}
      >
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
          {showSenderOptions ? (
            <div style={{ display: "flex" }}>
              <Button onClick={handleShowEdit}>
                <small
                  className="mt-2 d-block text-black-50"
                  style={{ marginRight: "4px", paddingBottom: "6px" }}
                >
                  <FontAwesomeIcon className="mr-1 opacity-5" />
                  Edit
                </small>
              </Button>
              <Button onClick={handleDeleteContent}>
                <small
                  className="mt-2 d-block text-black-50"
                  style={{ marginLeft: "4px", paddingBottom: "6px" }}
                >
                  <FontAwesomeIcon className="mr-1 opacity-5" />
                  Delete
                </small>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

MessageSent.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number,
    content: PropTypes.string,
    dateCreated: PropTypes.date,
    sender: PropTypes.shape({
      avatarUrl: PropTypes.string,
    }),
  }),
  handleShowEdit: PropTypes.func,
  handleDeleteContent: PropTypes.func,
};

export default MessageSent;
