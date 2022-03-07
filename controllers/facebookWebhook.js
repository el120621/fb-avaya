const request = require("request");
require("dotenv").config();

const verifyWebhook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "token123";
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }

};


// Function for the endpoint for our webhook 
const webhookFacebook = (req, res) => {
    const data = req.body;
    if (data.object === 'page') {
		//Note that entry is an array and may contain multiple objects, 
        //so ensure your code iterates over it to process all events.
        data.entry.forEach(function(entry){
            if(entry.messaging){
                console.log(entry.messaging[0].sender.id,entry.messaging[0].message.text);
                callSendAPI(entry.messaging[0].sender.id,entry.messaging[0].message.text);

                // sendToACR.handleMessage(entry.messaging[0].sender.id,entry.messaging[0].message.text)
                //functions.callSendAPI(entry.messaging[0].sender.id,entry.messaging[0].message.text)
            }
            // if(entry.changes){
            //     console.log(entry.changes)
            // }
        })
        
    // Return a 200 status code to Facebook 
    res.sendStatus(200);
	} else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

}

function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": {"text" : response}
    }
  
    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v7.0/me/messages",
      "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!');
      }
      else{
        console.error("Unable to send message:" + err);
      }
    }); 
  }



module.exports = {
    webhookFacebook,
    verifyWebhook
}