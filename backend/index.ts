import cors from  'cors'
import express from 'express'
import expressWs from "express-ws";
import {ActiveConnections, IncomingMessage} from "./types";

const app = express()
expressWs(app)

const port = 8000;

app.use(cors())

const router = express.Router()

const activeConnections:ActiveConnections = {}


router.ws('/draw',(ws, _req, _next)=>{
  const id = crypto.randomUUID()
  console.log('Client connected')
  activeConnections[id] = ws

  let username = 'Anonymous'
  
  ws.on('close', ()=>{
    console.log('Client disconnected')
    delete activeConnections[id]
  })
})

app.use(router)

app.listen(port, ()=>{
  console.log('Server start on port: ', port)
})