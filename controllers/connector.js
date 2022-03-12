const acr = require('../controllers/acr')

function fbToACR(senderID,messageText){
    // send Facebook Messenger message to Contact Center or Chatbot
	const chatsession = acr.chatsessions.find(c => c.senderId === senderID);	// check if existing chatsession
	if (chatsession) {
		acr.sendChatToACR(chatsession.acrSessionId, messageText)
	} else {
		acr.chatSessionRequest(senderID, 'Sales', messageText)
	}
}

module.exports = {
    fbToACR
}