import React, {useEffect, useRef, useState} from 'react';
import '@aws-amplify/ui-react/styles.css';
import {Storage} from "@aws-amplify/storage";
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import {v4 as uuidv4} from 'uuid';
import {Button, Heading, Image, TextField, withAuthenticator} from "@aws-amplify/ui-react";
import copy from 'copy-to-clipboard';
import {toast, Toaster} from "react-hot-toast";

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
        copyImageUrl(realUrl);
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

  const copyImageUrl = (realUrl) => {
    copy(realUrl);
    toast("Copied to clipboard");
  }

  return (
    <div className="App">
      <Toaster/>
      <Button onClick={args.signOut}>Sign out</Button>
      <Heading level={2}>Hello, {args.user.username}!</Heading>
      <div>
        <Image
          ref={firstImageRef}
          src={copiedImageURL}
          draggable={false}
          width={'100px'}
          height={'100px'}
          alt={copiedImageURL}
        />
      </div>
      <div>
        <Button onClick={() => handleCopyImage()}>
          <span>Upload image</span>
        </Button>
      </div>
    </div>
  );
};

export default withAuthenticator(App);
