import React, { useState } from 'react'
import './App.css'
import { uploadFile } from './services/upload';

const APP_STATUS = {
  IDLE: "idle",
  ERROR: "error",
  UPLOADING: "uploading",
  READY_UPLOAD: "ready_upload",
  READY_USAGE: "ready_usage"
} as const;
type AppStatusType = typeof APP_STATUS[keyof typeof APP_STATUS];

const BUTTON_TEXT = {
  [APP_STATUS.READY_UPLOAD] : "Upload file",
  [APP_STATUS.UPLOADING] : "Uploading file..."
}

function App() {
  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE);
  const [file, setFile] = useState<File | null>(null);

  // In this function we can know the moment when the user
  // upload his file and in that way, we can change the state
  // of the APP.
  const handleInputChange = (event: React
    .ChangeEvent<HTMLInputElement>) => {
      const [file] = event.target.files ?? []
    
      if(file) {
        setFile(file);
        setAppStatus(APP_STATUS.READY_UPLOAD);
      }
  }

  // 
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if(appStatus !== APP_STATUS.READY_UPLOAD || !file) {
      return;
    }
    setAppStatus(APP_STATUS.UPLOADING);

    const [err, data] = await uploadFile(file);
    console.log({err, data});
  }

  const showButton = appStatus === APP_STATUS.READY_UPLOAD || appStatus === APP_STATUS.UPLOADING;

  return (
    <>
      <h4>Challenge: CSV + Search</h4>
      <form onSubmit={handleSubmit}>
        <label>
          <input 
            onChange={handleInputChange} 
            type="file" 
            accept='.csv' 
            name="file" 
            id="file" 
            disabled={appStatus === APP_STATUS.UPLOADING}/>
        </label>

        {/* In this way we can secure about the time when the
            user can upload the file */}
        {showButton && (
          <button
            disabled={appStatus === APP_STATUS.UPLOADING}>
            {BUTTON_TEXT[appStatus]}
          </button>
        )}
      </form>
    </>
  )
}

export default App
