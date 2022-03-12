const config = require('../config')
const request = require('request')


const callSendAPI = (sender_psid, response) => {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": {
        "text" : response}
      }
  
    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v7.0/me/messages",
      "qs": { "access_token": config.facebook.accessToken },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log(res.statusCode,'Message sent to fb: ',request_body)
      }
      else{
        console.error("Unable to send message:" + err);
      }
    }); 
  
  }

  const sendToClient = (id,chat) => {
    request({
      uri: 'http://localhost:3001/fbchat',
      method: 'POST',
      json: {
          "id":id,
          "message":chat,
          "right":false
      }}, (err,res,body) => {
        if(!err){
          //console.log(body) ok
        }    
      })
  }


  

module.exports = {
    callSendAPI,
    sendToClient
}