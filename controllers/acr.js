const request = require('request')
const facebookWebhook = require('./facebookWebhook')

let serverKey = 'installationID123'
let apiKey = 'ximaapikey123'



function chatSessionRequest(senderID, skill, chat) {
    request('http://localhost:3001/status?installation-id=' + serverKey, (err, res, body) => {
        var extract = JSON.parse(body)
        if (!err && res.statusCode == 200) {
            if (extract[skill].thereAreAgentsReady) {
                //facebookWebhook.callSendAPI(senderID, 'Please wait while we try to connect you to an agent...')
                console.log('Please wait while we try to connect you to an agent...')

                // //post to chat api queue
                request({
                    uri: 'http://localhost:3001/chat/apiqueue',
                    method: 'POST',
                    json: {
                        "installationId": serverKey
                    }
                }, (err,res,body) => {
                    console.log(body);
                })
            }
        }
    })
}

chatSessionRequest(123, 'Sales', 'Hello');
