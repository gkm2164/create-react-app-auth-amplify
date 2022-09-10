import React, {useEffect, useRef, useState} from 'react';
import '@aws-amplify/ui-react/styles.css';
import {Storage} from "@aws-amplify/storage";
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import {v4 as uuidv4} from 'uuid';
import {Button, Heading, Image, TextField, withAuthenticator} from "@aws-amplify/ui-react";
import {CopyToClipboard} from "react-copy-to-clipboard/src";

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
      <Button onClick={args.signOut}>Sign out</Button>
      <Heading level={2}>Hello, {args.user.username}!</Heading>
      <Image
        ref={firstImageRef}
        src={copiedImageURL}
        draggable={false}
        width={'500px'}
        height={'500px'}
        alt={copiedImageURL}
      />
      <TextField disabled={true} value={copiedImageURL}/>
      <Button onClick={() => handleCopyImage()}>
        <span>Upload image</span>
      </Button>
      <CopyToClipboard text={copiedImageURL}>
        <Button disabled={!copiedImageURL}>
          <span>Copy Image Url</span>
        </Button>
      </CopyToClipboard>
    </div>
  );
};

export default withAuthenticator(App);
