const express = require('express')
const { send } = require('express/lib/response')

const app = express()

app.use(express.json())

//chat session request
app.get('/status',(req,res)=>{
    if(req.query['installation-id']==='installationID123'){
        res.json({
            "Sales":{
                "thereAreAgentsReady": true
            },
            "Support":{
                "thereAreAgentsReady": false
            }
        })
    }
})

app.post('/chat/apiqueue',(req,res)=>{
    console.log(req.body)
    res.json(req.body)
})



// ********* Express server **********
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Now listening on port ${port}...`)); 