
require("dotenv").config();
async function sendWppImage(client, sendTo, nameImage, captionText = "image"){
    let pathImage = process.env.PATH_TO_IMAGE_UPLOAD + nameImage;
    let response = await client
  .sendImage(
    sendTo,
    pathImage,
    nameImage,
    captionText
  )
  return response;
}

module.exports = sendWppImage;