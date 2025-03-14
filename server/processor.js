require('@tensorflow/tfjs-node')
const sharp = require('sharp');
const faceapi = require('face-api.js');
const canvas = require('canvas');

const express = require('express');
const path = require('path');

const app = express();

const fs = require('fs')
faceapi.env.monkeyPatch({ Canvas: canvas.Canvas, Image: canvas.Image, ImageData: canvas.ImageData });

async function processAndDetectFaces(imageBuffer) {
  // Load models for face detection
  // await faceapi.nets.tinyFaceDetector.loadFromDisk('../models');
  // await faceapi.nets.faceLandmark68Net.loadFromDisk('../models');

  await faceDetectionNet.loadFromDisk('../models')
  await faceapi.nets.faceLandmark68Net.loadFromDisk('../models')
  await faceapi.nets.faceRecognitionNet.loadFromDisk('../models')

  const referenceImage = await canvas.loadImage(REFERENCE_IMAGE)
  const queryImage = await canvas.loadImage(QUERY_IMAGE)

  const resultsRef = await faceapi.detectAllFaces(referenceImage, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors()

  const resultsQuery = await faceapi.detectAllFaces(queryImage, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors()

  const faceMatcher = new faceapi.FaceMatcher(resultsRef)

  const labels = faceMatcher.labeledDescriptors
    .map(ld => ld.label)
  const refDrawBoxes = resultsRef
    .map(res => res.detection.box)
    .map((box, i) => new faceapi.draw.DrawBox(box, { label: labels[i] }))
  const outRef = faceapi.createCanvasFromMedia(referenceImage)
  refDrawBoxes.forEach(drawBox => drawBox.draw(outRef))
  
  // Load and process the image using sharp
  const image = sharp(imageBuffer);
  
  // // Detect faces
  const faceDetectionOptions = new faceapi.TinyFaceDetectorOptions();
  // const detectedFaces = await faceapi.detectAllFaces(imageBuffer, faceDetectionOptions);

  // // Process each detected face
  // for (const face of detectedFaces) {
  //   // Enhance image quality if needed
  //   if (face.detection._score < 0.5) {
  //     image.sharpen();
  //   }

  //   // Crop the face region (you can adjust the coordinates as needed)
  //   const { x, y, width, height } = face.detection.box;
  //   const faceImageBuffer = await image.extract({ left: x, top: y, width, height }).toBuffer();
    
  //   // You can further process or save the cropped faceImageBuffer
  //   console.log(faceImageBuffer)
  // }
}



const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Call the function with your uploaded image buffer
  const uploadedImageBuffer = fs.readFileSync('./uploads/1692530710283-453925681.webp');
  processAndDetectFaces(uploadedImageBuffer);
});