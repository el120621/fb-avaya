const acr = require('../controllers/acr')

function fbToACR(senderID,messageText){
    // send Facebook Messenger message to Contact Center
	const chatsession = acr.chatsessions.find(c => c.senderId === senderID);// check if existing chatsession
	if (chatsession) {
		acr.sendChatToACR(chatsession.acrSessionId, messageText) // Direct Send
	} else {
		acr.chatSessionRequest(senderID, 'Customer Service', messageText) // Session Request
		//console.log(senderID,messageText)
	}
}

module.exports = {
    fbToACR
}