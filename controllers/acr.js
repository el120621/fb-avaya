const request = require('request')
const functions = require('../services/functions')
const config = require('../config')

// Load the AWS SDK for ACR web chat
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretKey
});
AWS.config.region = "us-east-1";
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

let chatsessions = [
	{senderId: '', acrSessionId: '', acrServerQueue: ''}
]

// Initialize ACR
let intervalACR;
let stillHere = 0;

function chatSessionRequest(senderID, skill, chat) {
    request('https://mm-v1.ximasoftware.com/queue/status?installation-id=' + config.xima.serverKey, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            var extract = JSON.parse(body)
            if (extract[skill].thereAreAgentsReady) {

                functions.callSendAPI(senderID, config.message.tryAgent)
                console.log(config.message.tryAgent,res.statusCode)

                // //post to chat api queue
                request({
                    uri: 'https://mm-v1.ximasoftware.com/chat/apiqueue',
                    method: 'POST',
                    json: {
                        "installationId": config.xima.serverKey, 
                        "email": skill, 
                        "name": senderID, 
                        "skill": skill, 
                        "apiKey": config.xima.apiKey
                    }
                }, (err,res,body) => {
                    if (!err && res.statusCode == 200) {
                        console.log('Chat queued!')                        
                        const chatsession = {
                            senderId: senderID,		
                            acrSessionId: body.id,
                            acrServerQueue: body.serverToClientQueue.url,
                            };
                        chatsessions.push(chatsession)
                        console.log('Chat session: ',chatsession)
            
                        sendChatToACR(body.id, chat)

                        if (chatsessions.length < 3) {
                            intervalACR = setInterval(checkForChatFromACR, 3000);
                        }    

                    }else {
                        console.error("Unable to start a chatsession.");
                    }
                })
            }
            else {
            // no agents available for skill
            //functions.fbSendmessage(senderID, config.message.noAgent); 
            console.log('No agents available, please try later...')
            }
        }else {
            console.log(res.statusCode)//Bad Request
		}
    })
}

// this function will be called every 2 seconds to check for incoming messages from ACR
function checkForChatFromACR() {
    console.log('Receiving message from ACR...')
	var iLength = chatsessions.length;
	if (iLength > 1) {
		for (i=1; i < iLength; i++) {
			receiveMessageSQS(chatsessions[i].senderId, chatsessions[i].acrServerQueue);
			}
	} else {
		clearInterval(intervalACR);
        console.log('Session Ended/Interval Cleared')
	}
}


// check for incoming chat messages from ACR
function receiveMessageSQS(recipientId, serverToClientQueue) {
    var params = {
        QueueUrl: serverToClientQueue
      };
      sqs.receiveMessage(params, (err, data) => {
        if (err) {
          console.log("Error retrieving from queue")
          return;
        }
        const messages = data.Messages;
        if (messages) {
            var body = messages[0].Body;
            var extract = JSON.parse(body);
            switch (extract.type) {
                case 'CHAT_STARTED' :
                  functions.callSendAPI(recipientId, config.message.connectedAgent + extract.agent);
                  break;
                case 'CHAT_TEXT' :
                  functions.callSendAPI(recipientId, extract.text);
                  break;
                case 'CHAT_TRANSFERRED' :
                  functions.callSendAPI(recipientId, config.message.connectedAgent + extract.newAgent);
                  break;
                //case 'ESTIMATED_WAIT_TIME' :
                //  sendMessage(recipientId, 'All our agents are busy, estimated wait time is '+extract.estimatedWait);
                //  break;
                case 'CHAT_ENDED' :
                  functions.callSendAPI(recipientId, config.message.chatEnded);
                  const entry = chatsessions.findIndex(c => c.senderId === recipientId);
                  chatsessions.splice(entry,1);
                default :
                  // do something when other chat type is received
                  break;
            }
            deleteMessage(messages[0].ReceiptHandle, serverToClientQueue);
        }
      });
    
}

// delete message from AWS ServerToClientQueue
function deleteMessage(handle, serverToClientQueue) {
    var params = {
        QueueUrl: serverToClientQueue,
        ReceiptHandle: handle
    };
    sqs.deleteMessage(params, (err, data) => {
        if (err) {
            console.log("There was a problem deleting the message from ACR queue")
        }
    })
}

// send chat to ACR
function sendChatToACR(sessionId, chatText) {
	request({
        uri: 'https://mm-v1.ximasoftware.com/chat',
        method: 'POST',
		json: { "chatSessionId": sessionId, "message": chatText }
    }, (err, res, body) => {
        if (!err && res.statusCode == 204) {
        //successfull 
            console.log(res.statusCode)
            console.log("Chat Sent to ACR!")
            console.log("sessionID: "+sessionId)
            console.log("message: "+chatText)
        } else {
			console.log(res.statusCode);
        }
    });
}


module.exports = {
	chatsessions,
	sendChatToACR,
	chatSessionRequest
}

 
