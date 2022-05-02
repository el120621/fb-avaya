require("dotenv").config();

const config = {
    message: {
        tryAgent: 'Please wait while we try to connect you to an agent...',
        noAgent: 'No agents available, please try later...',
		connectedAgent: 'You are now connected to ',
		chatEnded: 'Chatsession is ended by agent...',
		welcomeChatbot: 'Welcome, how can I help you?'
    },
	xima: {
		apiKey: process.env.XIMA_API_KEY,
		serverKey: process.env.XIMA_SERVER_KEY
	},
	aws: {
		accessKey: process.env.AWS_ACCESS_KEY,
		secretKey: process.env.AWS_SECRET_KEY
	},
	facebook: {
		accessToken: process.env.PAGE_ACCESS_TOKEN,
		verifyToken: process.env.FB_VERIFY_TOKEN
	}
}


module.exports = config;