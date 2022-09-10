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
      const imageSrc = firstImageRef.current?.src
      console.log(imageSrc);
      if (thisBlob) {
        console.log("has blob");
        const imageUrl = uuidv4();
        await uploadImage(imageUrl, thisBlob);
        console.log("uploaded image");
        const realUrl = `https://s3.amazonaws.com/image.gben.me/images/${imageUrl}`;
        setCopiedImageURL(realUrl);
      }
    } catch (e) {
      if (e?.message) alert(e.message)
    }
  }

  const uploadImage = async (imageName, blob) => {
    console.log(imageName);

    try {
      const result = await Storage.put(`images/${imageName}`, blob, {contentType: "image/png"})
      console.log(result);
      return result;
    } catch (e) {
      console.log("error from S3: " + e);
    }
  }

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

    document.addEventListener('paste', handlePasteOnDocument)

    return () => {
      document.removeEventListener('paste', handlePasteOnDocument)
    }
  })

  console.log(args);

  return (
    <div className="App">
      <button onClick={args.signOut}>Sign out</button>
      <h1>Logined as {args.user.username}</h1>
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
// };
//
// export function SetS3Config(bucket, level) {
//   Storage.configure({
//     bucket: bucket,
//     level: level,
//     region: aws_exports.aws_cognito_region,
//     identityPoolId: aws_exports.aws_cognito_identity_pool_id
//   });
// }

export default withAuthenticator(App);
