import React, { Fragment } from "react";
import logger from "sabio-debug";
import * as messageService from "../../services/messageService";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PerfectScrollbar from "react-perfect-scrollbar";
import {
  IconButton,
  Typography,
  Button,
  List,
  Tooltip,
  TextField,
} from "@material-ui/core";
import { Formik } from "formik";
import PropTypes from "prop-types";
import FileUpload from './FileUpload';
import Conversation from "./Conversation";
import MessageSent from "./MessageSent";
import FriendsList from "./FriendsList";
import MessagesRecieved from "./MessagesRecieved";

const _logger = logger.extend("Message");

class Messages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messagesSent: [],
      messagesRecieved: [],
      feed: [],

      messageData: {
        content: "",
        subject: "n/a",
        recipientId: 0,
      },
      isShown: false,
      isActive: true,
      showSenderOptions: false,
      messageId: null,
      showUploader: false,
      hoverId: null,
      threadMemberId: {
        name: "",
        id: 0,
      },
    };
  }

  componentDidMount() {
    messageService
      .getFeed()
      .then(this.onGetFeedSuccess)
      .catch(this.onGetFeedError);
  }

  onGetFeedSuccess = (response) => {
    this.setState((prevState) => {
      _logger(response);
      return {
        ...prevState,
        inbox: response.data.items.map(this.mapFeed),
      };
    });
  };

  mappedMessage = (messages) => (
    <Messages key={messages.id} friend={messages} />
  );

  mapFeed = (sender) => (
    <Conversation
      key={sender.id}
      sender={sender}
      onGetMessageThread={this.onGetMessageThread}
    />
  );

  onGetMessageThread = (sender) => {
    _logger(sender);
    this.setState({
      messagesSent: [],
      messagesRecieved: [],
      messageData: {
        subject: sender.firstName + " " + sender.lastName,
        recipientId: parseInt(sender.id),
      },
      threadMemberId: {
        name: sender.firstName + " " + sender.lastName,
        id: sender.id,
      },
    });

    messageService
      .getMessagesSent(sender.id, this.props.currentUser.id)
      .then(this.onMessagesSentSuccess)
      .catch(this.onMessagesSentError);
    messageService
      .getMessagesRecieved(this.props.currentUser.id, sender.id)
      .then(this.onMessagesRecievedSuccess)
      .catch(this.onMessagesRecievedError);
  };

  onGetThreadRefresh = () => {
    this.setState({
      messagesSent: [],
      messagesRecieved: [],
      messageData: {
        ...this.state.messageData,
        content: "",
      },
    });
    messageService
      .getMessagesSent(this.state.threadMemberId.id, this.props.currentUser.id)
      .then(this.onMessagesSentSuccess)
      .catch(this.onMessagesSentError);
    messageService
      .getMessagesRecieved(
        this.props.currentUser.id,
        this.state.threadMemberId.id
      )
      .then(this.onMessagesRecievedSuccess)
      .catch(this.onMessagesRecievedError);
  };

  mapSent = (message) => {
    return (
      <MessageSent
        message={message}
        key={message.key}
        handleShowEdit={this.handleShowEdit}
        handleDeleteContent={this.handleDeleteContent}
      />
    );
  };

  mapRecieved = (message) => {
    return <MessagesRecieved message={message} key={message.key} />;
  };

  onMessagesSentSuccess = (response) => {
    this.setState((prevState) => {
      return {
        ...prevState,
        messagesSent: response.data.items.map(this.mapSent),
      };
    });
  };

  onMessagesSentError = (errResponse) => {
    _logger(errResponse);
  };

  onMessagesRecievedSuccess = (response) => {
    this.setState((prevState) => {
      return {
        ...prevState,
        messagesRecieved: response.data.items.map(this.mapRecieved),
      };
    });
  };

  onMessagesRecievedError = (errResponse) => {
    _logger(errResponse);
  };

  onGetFeedError = (errResponse) => {
    _logger(errResponse);
  };

  handleContentChange = (e) => {
    this.setState({
      messageData: {
        ...this.state.messageData,
        content: e.target.value,
      },
    });
    _logger(this.state.messageData.content);
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    this.setState({
      messageData: {
        content: this.state.messageData.content,
        recipientId: parseInt(this.state.threadMemberId.id),
      },
    });
    messageService
      .sendMessage(this.state.messageData)
      .then(this.onFormSubmitSuccess)
      .catch(this.onFormSubmitError);
  };

  handleMessageUpdate = (e) => {
    e.preventDefault();
    let id = this.state.messageId;
    messageService
      .updateMessage(this.state.messageData, id)
      .then(this.onUpdateSuccess)
      .catch(this.onUpdateError);
  };

  onFormSubmitSuccess = () => {
    this.onGetThreadRefresh();
  };

  onFormSubmitError = (errResponse) => {
    _logger(errResponse);
  };

  onUpdateSuccess = () => {
    this.handleHideEdit();
    this.onGetThreadRefresh();
  };

  onUpdateError = (errResponse) => {
    _logger(errResponse);
  };

  handleDeleteContent = (id) => {
    messageService
      .deleteMessage(id)
      .then(this.onDeleteSuccess)
      .catch(this.onDeleteError);
  };

  onDeleteSuccess = () => {
    this.onGetThreadRefresh();
  };

  onDeleteError = (errResponse) => {
    _logger(errResponse);
  };

  handleShowEdit = (message) => {
    this.setState({
      messageData: {
        content: message.content,
        subject: "n/a",
        recipientId: parseInt(this.state.threadMemberId.id),
      },
      messageId: message.id,
      isShown: true,
      isActive: false,
    });
  };

  handleHideEdit = () => {
    this.setState({
      messageData: {
        content: "",
        subject: "n/a",
        recipientId: parseInt(this.state.threadMemberId.id),
      },
      messageId: null,
      isShown: false,
      isActive: true,
    });
  };

  updateUrl = (url) => {
   	_logger('Url uploaded is ', url);

   	this.setState({ uploadedContent: url });
   };

   handleShowUploader = () => {
   	this.setState({ showUploader: !this.state.showUploader });
   };

  render() {
    return (
      <>
        <Fragment>
          <div
            className="app-inner-content-layout"
            style={{ marginBottom: "20px" }}
          >
            <div className="d-flex d-lg-none p-4 order-0 justify-content-between align-items-center"></div>
            <div
              className={clsx(
                "app-inner-content-layout--sidebar bg-white app-inner-content-layout--sidebar__lg order-1"
              )}
            >
              <PerfectScrollbar>
                <div className="px-4 pt-4">
                  <Typography
                    color="primary"
                    component="div"
                    className="d-flex p-3 align-items-center"
                  >
                    <div className="text-uppercase font-size-sm text-first font-weight-bold">
                      Inbox
                    </div>
                    <div className="ml-auto font-size-xs">
                      <Tooltip
                        arrow
                        title="Compose New Message"
                        placement="left"
                      >
                        <IconButton size="small" className="text-success">
                          <FontAwesomeIcon
                            icon={["fas", "plus-circle"]}
                            className="font-size-sm"
                          />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </Typography>
                  <PerfectScrollbar>
                    <List>{this.state.inbox}</List>
                  </PerfectScrollbar>
                </div>
              </PerfectScrollbar>
            </div>
            <div className="app-inner-content-layout--main order-3 order-lg-2 card-box bg-secondary">
              <div className="card-header app-inner-content-layout--main__header rounded-0 bg-white p-4 border-bottom">
                <div className="card-header--title">
                  <small>Messenger</small>
                  <b>Talking to {this.state.threadMemberId.name}</b>
                </div>
              </div>
              <PerfectScrollbar>
                <div className="chat-wrapper p-3">
                  {this.state.messagesRecieved}
                  {this.state.messagesSent}
                </div>
              </PerfectScrollbar>
              <Formik initialValues={this.state.messageData}>
                <form>
                  <div className="card-footer bg-white p-4">
                    <div>
                      <TextField
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        placeholder="Write your message and hit enter to send..."
                        id="content"
                        name="content"
                        onChange={this.handleContentChange}
                        value={this.state.messageData.content}
                      />
                    </div>
                    <div className="align-box-row mt-3">
                       
											File uploader - work in progress
											<div className="align-items-center">
												<Tooltip arrow title="Upload Documents">
													<IconButton
														color="default"
														className="text-info"
														onClick={this.handleShowUploader}
													>
														<FontAwesomeIcon
															icon={['far', 'file-excel']}
															className="font-size-xl"
														/>
													</IconButton>
												</Tooltip>
												{this.state.showUploader ? (
													<Button
														size="small"
														variant="contained"
														color="primary"
														type="submit"
														value="Submit"
														onClick={this.handleShowUploader}
														style={{ backgroundColor: '#EA4F51', color: 'white' }}
													>
														Cancel Upload
													</Button>
												) : null}

												{this.state.showUploader ? (
													<FileUpload
														updateUrl={(response) => {
															this.updateUrl(response);
														}}
														isMultiple={true}
													/>
												) : null}
											</div>
                      <div className="ml-auto">
                        {this.state.isActive ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            type="submit"
                            value="Submit"
                            onClick={this.handleFormSubmit}
                          >
                            Send
                          </Button>
                        ) : null}
                        {this.state.isShown ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            type="submit"
                            value="Submit"
                            style={{ marginRight: "7px" }}
                            onClick={this.handleMessageUpdate}
                          >
                            Change
                          </Button>
                        ) : null}
                        {this.state.isShown ? (
                          <Button
                            size="small"
                            variant="contained"
                            type="submit"
                            value="Submit"
                            style={{
                              backgroundColor: "#EA4F51",
                              color: "white",
                            }}
                            onClick={this.handleHideEdit}
                          >
                            Cancel
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </form>
              </Formik>
            </div>
            <FriendsList />
          </div>
        </Fragment>
      </>
    );
  }
}

Messages.propTypes = {
  currentUser: PropTypes.objectOf.isRequired,
  onClick: PropTypes.func,
};

export default Messages;
