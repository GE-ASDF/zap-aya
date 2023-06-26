async function sendWppMessage(client, sendTo, message){
    let response = await client.sendText(sendTo, message)
   .then((res)=>{
        console.log(res)
        return res;
    }).catch((err)=>{
        return err;
    })
    return response;
}

module.exports = sendWppMessage