async function sendWppImage(client, sendTo, nameImage, captionText = "image"){
    let pathImage = "/uploads/" + nameImage;
    let response = await client
  .sendImage(
    sendTo,
    pathImage,
    nameImage,
    captionText
  )
  .then((result) => {
    return result;
  })
  .catch((erro) => {
    return erro;
  });
  return response;
}

module.exports = sendWppImage;