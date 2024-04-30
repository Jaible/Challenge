import React, { useState } from 'react'
import { Toaster, toast } from 'sonner'
import './App.css'
import { uploadFile } from './services/upload';
import { Data } from './types';
import { Search } from './steps/search';

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
  const [Data, setData] = useState<Data>([]);
  const [File, setFile] = useState<File | null>(null);

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

    if(appStatus !== APP_STATUS.READY_UPLOAD || !File) {
      return;
    }
    setAppStatus(APP_STATUS.UPLOADING);

    const [err, newData] = await uploadFile(File);

    if(err) {
      setAppStatus(APP_STATUS.ERROR);
      toast.error(err.message);
      return;
    }

    setAppStatus(APP_STATUS.READY_USAGE)
    if (newData) setData(newData);
    toast.success("File uploaded correctly!")
  }

  const showButton = appStatus === APP_STATUS.READY_UPLOAD || appStatus === APP_STATUS.UPLOADING;
  const showInput = appStatus !== APP_STATUS.READY_USAGE

  return (
    <>
      <Toaster/>
      <h4>Challenge: CSV + Search</h4>

      {
        showInput && (
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
      )}

      {
        appStatus === APP_STATUS.READY_USAGE && (
          <Search initialData={Data}/>
        )
      }
    </>
  )
}

export default App
