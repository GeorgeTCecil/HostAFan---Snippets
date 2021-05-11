import React, { Component } from "react";
import PropTypes from "prop-types";

import { Grid, List, ListItem } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";

import Dropzone from "react-dropzone";

import * as fileService from "../services/fileUploadService";

import logger from "sabio-debug";
const _logger = logger.extend("FileUpload");

class FileUpload extends Component {
  state = {
    files: [],
    error: false,
    uploading: false,
    failed: false,
  };

  onDrop = (files) => {
    if (this.props.isMultiple === false && files.length > 1) {
      this.setState({ error: true });
      return;
    } else {
      this.setState({ error: false, uploading: true, failed: false });
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        formData.append("files", file);
      }
      fileService
        .upload(formData)
        .then(this.onUploadSuccess)
        .catch(this.onUploadError);
    }
  };

  onUploadSuccess = (response) => {
    this.setState({ files: response.items, uploading: false });

    this.props.updateUrl(this.state.files);
  };

  onUploadError = (response) => {
    _logger("unsuccessful", response);
    this.setState({ uploading: false, failed: true });
  };

  onCancel = () => {
    this.setState({
      files: [],
    });
  };

  render() {
    _logger(this.state);

    const files = this.state.files.map((file) => (
      <ListItem key={file.name}>{file.name}</ListItem>
    ));

    return (
      <Grid container spacing={4} className="mt-4">
        <Grid item xs={12} sm={6}>
          <div className="dropzone">
            <Dropzone onDrop={this.onDrop} onFileDialogCancel={this.onCancel}>
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div className="dz-message">
                    <div className="dx-text">
                      {this.props.isMultiple
                        ? "Drop files here, or click to select files to upload."
                        : "Drop file here, or click to select file to upload."}
                    </div>
                  </div>
                </div>
              )}
            </Dropzone>
          </div>
        </Grid>
        <Grid
          item
          md={6}
          className="d-flex justify-content-center align-items-center"
        >
          <div className="w-100">
            {this.state.uploading && (
              <MuiAlert severity="info">Uploading...</MuiAlert>
            )}
            {this.state.error && (
              <MuiAlert severity="warning">
                Please only upload one file
              </MuiAlert>
            )}
            {this.state.failed && (
              <MuiAlert severity="warning">Could not upload file</MuiAlert>
            )}
            {!this.state.uploading && this.state.files.length === 0 && (
              <MuiAlert severity="success">
                {this.props.isMultiple
                  ? "Uploaded files will appear here!"
                  : "Uploaded file will appear here!"}
              </MuiAlert>
            )}
            {this.state.files.length > 0 && (
              <List>
                <ListItem className="font-weight-bold text-center">
                  {this.props.isMultiple ? "Uploaded Files" : "Uploaded File"}
                </ListItem>
                {files}
              </List>
            )}
          </div>
        </Grid>
      </Grid>
    );
  }
}

FileUpload.propTypes = {
  isMultiple: PropTypes.bool.isRequired,
  updateUrl: PropTypes.func.isRequired,
};

export default FileUpload;
