import express, { json } from 'express'
import cors from 'cors'
import fs from 'node:fs/promises' //fs: File system (reading)
import path from 'node:path'
import crypto from 'node:crypto'

const PORT = process.env.PORT ?? 3000
const app = express()
app.use(cors(
  {
    origin: [`https://localhost:${PORT}`, 'https://chat.openai.com']
  }
))
app.use(json())

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`)
  next()
})
//1. Preparar los endpoints para servir la informacion
//que necesita el plugin de ChatGpt
app.get('/openapi.yaml', async (req, res, next) => {
  try {
    const filePath = path.join(process.cwd(), 'openapi.yaml')
    const yamlData = await fs.readFile(filePath, 'utf-8')
    res.setHeader('Content-Type', 'text/yaml')
    res.send(yamlData)
    
  } catch (error) {
    res.status(500).send({error: "unable to fecth openapi.yaml manifest"})
  }
})

app.get('./well-knwon/ai-plugin.json', async (req, res, next) => {
  res.sendFile(path.join(process.cwd.apply(), './well-knwon/ai-plugin.json'))
})

app.get('/logo.png', async (req, res, next) => {
  res.sendFile(path.join(process.cwd(), 'logo.png'))
})

//2.Los endpointd de la API para que funcione
//el plugion de chatGpt con los todos

app.get('/search', async (req, res) => {

  const { q } = req.params

  const apiURL = `https://api.github.com/search/repositories?q=${q}`
  const apiResponse = await fetch(apiURL, {
    headers: {
      'User-Agent': 'ChatGpt plugin v.1.0.0 - fariTech',
      'Accept': 'application/vnd.github.v3+json'
    }
  })

  if(!apiResponse.ok) {
    return res.sendStatus(apiResponse.status)
  }

  console.log('te quedan: ', apiResponse.headers.get('X-Ratelimit-Remaining'));

  const json = await apiResponse.json()

  const repos = json.items.map(item =>({
    name: item.name,
    description: item.description,
    stars: item.stargazers_count,
    url: item.html_url
  }))

  return res.json({ repos })
})

//3.Iniciar el servidor

app.listen(PORT, () => {
  console.log('ChatGpt Plugin is listening on port', PORT);
})
