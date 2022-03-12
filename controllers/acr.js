const request = require('request')
const functions = require('../services/functions')
const config = require('../config')

let serverKey = 'installationID123'
let apiKey = 'ximaapikey123'

let chatsessions = [
	{senderId: '', acrSessionId: '', acrServerQueue: ''}
]

// Initialize ACR
let intervalACR

function chatSessionRequest(senderID, skill, chat) {
    request('http://localhost:3001/status?installation-id=' + serverKey, (err, res, body) => {
        var extract = JSON.parse(body)
        if (!err && res.statusCode == 200) {
            if (extract[skill].thereAreAgentsReady) {

                functions.callSendAPI(senderID, config.message.tryAgent)
                console.log(config.message.tryAgent,res.statusCode)

                // //post to chat api queue
                request({
                    uri: 'http://localhost:3001/chat/apiqueue',
                    method: 'POST',
                    json: {
                        "installationId": serverKey, 
                        "email": skill, 
                        "name": senderID, 
                        "skill": skill, 
                        "apiKey": apiKey
                    }
                }, (err,res,body) => {
                    if (!err && res.statusCode == 200) {
                        console.log('Chat queued!')
                        //
                        const chatsession = {
                            senderId: senderID,		
                            acrSessionId: body.sessionDetails.id,
                            acrServerQueue: body.sessionDetails.serverToClientQueue.url,
                            };
                        chatsessions.push(chatsession)

                        console.log('Chat session: ')
                        chatsessions.forEach(function(session){
                            console.log(session)
                        })

                        sendChatToACR(body.sessionDetails.id, chat)

                        if (chatsessions.length < 3) {
                            intervalACR = setInterval(checkForChatFromACR, 3000);
                        }    

                    }else {
                        console.error("Unable to start a chatsession.");
                    }
                })
            }else {
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
	var iLength = chatsessions.length;
	if (iLength > 1) {
		for (i=1; i < iLength; i++) {   
			receiveMessageSQS(chatsessions[i].senderId, chatsessions[i].acrServerQueue);
            console.log('Receiving message..')
			}
	} else {
		clearInterval(intervalACR);
        console.log('Interval Cleared')
	}
}


// check for incoming chat messages from ACR
function receiveMessageSQS(recipientId, serverToClientQueue) {
    
    request({
        uri: 'http://localhost:3001/sqs',
        method: 'POST',
		json: {"serverToClientQueue": serverToClientQueue}},
        (err,res,body)=>{
            let message = body
            if (message.length!==0) {
                var extract = message[0];
                switch (extract.type) {
                    case 'CHAT_STARTED' :
                      functions.callSendAPI(recipientId, config.message.connectedAgent + extract.agent);
                      functions.callSendAPI(recipientId, extract.message);
                      console.log(recipientId, config.message.connectedAgent + extract.agent)
                      console.log(recipientId, extract.message)
                      break;
                    case 'CHAT_TEXT' :
                      functions.callSendAPI(recipientId, extract.message)
                      console.log(recipientId, extract.message)
                      break;
                    case 'CHAT_TRANSFERRED' :
                      facebook.callSendAPI(recipientId, config.message.connectedAgent + extract.newAgent);
                      break;
                    //case 'ESTIMATED_WAIT_TIME' :
                    //  sendMessage(recipientId, 'All our agents are busy, estimated wait time is '+extract.estimatedWait);
                    //  break;
                    case 'CHAT_ENDED' :
                        console.log(recipientId, config.message.chatEnded)
                        functions.callSendAPI(recipientId, extract.message)
                        functions.callSendAPI(recipientId, config.message.chatEnded)

                       const entry = chatsessions.findIndex(c => c.senderId === recipientId);
                       chatsessions.splice(entry,1);
                    default :
                      // do something when other chat type is received
                      break;
                }
                deleteMessage(message[0].receiptHandle);
            }


    })

    //deleteMessage()
}

// delete message from AWS ServerToClientQueue
function deleteMessage(handle) {
    request({
        uri: 'http://localhost:3001/delete',
        method: 'POST',
		json: { "receiptHandle":handle }
    }, (err, res, body) => {
        if (!err) {
            console.log(res.statusCode)
        } else {
			console.log(res.statusCode);
        }
    });
}

// send chat to ACR
function sendChatToACR(sessionId, chatText) {
	request({
        uri: 'http://localhost:3001/chat',
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

 
