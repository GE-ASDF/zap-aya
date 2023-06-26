async function sendWppMessage(client, sendTo, message){
    let response = await client.sendText(sendTo, message)
    return response;
}

module.exports = sendWppMessage