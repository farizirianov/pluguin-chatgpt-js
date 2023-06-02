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

app.listen(PORT, () => {
  console.log('ChatGpt Plugin is listening on port', PORT);
})

//2.Los endpointd de la API para que funcione
//el plugion de chatGpt con los todos

let TODOS = [
  {id: crypto.randomUUID(), titule: 'Ver un nuevo curso'},
  {id: crypto.randomUUID(), titule: 'Subir el codigo a github'},
  {id: crypto.randomUUID(), titule: 'Crear un plugin'},
  {id: crypto.randomUUID(), titule: 'Ir a github'},
]

app.get('/todos', (req, res) =>{
  res.json({todos: TODOS});
})

app.post('/todos', (req, res) =>{
  const { title } = req.body
  const newTodo = {id: crypto.randomUUID(), title}
  
  TODOS.push(newTodo)
  res.json(newTodo);
})

app.get('/todos/:id', (req, res) =>{
  const { id } = req.params
  const todo = TODOS.find(todo => todo.id === id)
  console.log(id);
  res.json(todo);
})

app.put('/todos/:id', (req, res) =>{
  const { id } = req.params
  const { title } = req.body
  let newTodo = null

  TODOS = TODOS.map(todo => {
    if(todo.id === id) {
      newTodo = { ...todo, title }
      return newTodo;
    }

    return todo
  })

  return res.json(newTodo)
})

app.delete('/todos/:id', (req, res) =>{
  const { id } = req.params
  TODOS = TODOS.filter(todo => todo.id != id)

  return res.json({ok: true})
})


//3.Iniciar el servidor