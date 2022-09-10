import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {Storage} from "@aws-amplify/storage";
import {withAuthenticator} from '@aws-amplify/ui-react'
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import {v4 as uuidv4} from 'uuid';

Amplify.configure(aws_exports);

const App = (args) => {
  const [copiedImageURL, setCopiedImageURL] = useState('')
  const [thisBlob, setThisBlob] = useState(null);
  const firstImageRef = useRef(null)

  const handleCopyImage = async () => {
    try {
      if (thisBlob) {
        const imageUrl = uuidv4();
        await uploadImage(imageUrl, thisBlob);
        const realUrl = `https://images.gben.me/images/${imageUrl}`;
        setCopiedImageURL(realUrl);
      }
    } catch (e) {
      if (e?.message) alert(e.message)
    }
  }

  const uploadImage = (imageName, blob) =>
    Storage.put(`images/${imageName}`, blob, {contentType: "image/png"});

  const handleTransformDataTransferIntoURL = (dataTransfer) => {
    const [firstItem] = dataTransfer.items
    const blob = firstItem.getAsFile();
    setThisBlob(blob);
    return URL.createObjectURL(blob)
  }

  useEffect(() => {
    const handlePasteOnDocument = (e) => {
      if (e.clipboardData) {
        const url = handleTransformDataTransferIntoURL(e.clipboardData)
        setCopiedImageURL(url)
      }
    }

    document.addEventListener('paste', handlePasteOnDocument);
  })

  return (
    <div className="App">
      <button onClick={args.signOut}>Sign out</button>
      <h1>Hello, {args.user.username}!</h1>
      <div>
        <img
          ref={firstImageRef}
          src={copiedImageURL}
          draggable={false}
          width={'500px'}
          height={'500px'}
          alt={copiedImageURL}
        />
      </div>
      <div>
        <input disabled={true} value={copiedImageURL}/>
        <button onClick={() => handleCopyImage()}>
          <span>Copy image</span>
        </button>
      </div>
    </div>
  );
};

export default withAuthenticator(App);
