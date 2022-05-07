import express from 'express'
import {MongoClient, ObjectId} from 'mongodb'

const port = 3000;
const app = express()

app.set('views', './views');
app.set('view engine', 'ejs');

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('clubmembers');
const member = db.collection('members');

app.use(express.static('./views'));

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/medlemmar', async (req, res) => {
  const members = await member.find({}).toArray();
  res.render('medlemmar', {members});
})

app.get('/medlemmar/acending', async (req, res) =>{
  const members = await member.find({}).sort({name: 1}).toArray()

  res.render('medlemmar', {
    members
  });
})
app.get('/medlemmar/decending', async (req, res) =>{
  const members = await member.find({}).sort({name: -1}).toArray()
  res.render('medlemmar', {
    members
  })
})

app.get('/medlem/:id', async (req,res) => {
  const person = await member.findOne({ _id: ObjectId(req.params.id) });

  const date =  new Date(person.registered);
  let year = date.getFullYear()
  let month = date.getMonth()
  let day = date.getDate()

  if(month < 10){
    month = "0" + month
  }
  if(day < 10){
    day = "0" + day
  }
  res.render('medlem', {
    id: person._id,
    name: person.name,
    email: person.email,
    phonenumber: person.phonenumber,
    strength: person.strength,
    registered: `${year} - ${month} - ${day}`
  });
});

app.get('/medlem/:id/radera', async (req, res) =>{
  await member.deleteOne({ _id: ObjectId(req.params.id) });
  res.redirect('/medlemmar')
})

app.get('/blimedlem', (req, res) => {
  res.render('blimedlem')
})

app.use(express.urlencoded());

app.post('/blimedlem', async (req, res) => {
  await member.insertOne({
    ...req.body,
    registered: new Date()
  })

  res.redirect('/')
})

app.get('/uppdatera/:id', async (req, res) => {
  const person = await member.findOne({ _id: ObjectId(req.params.id) });

  res.render('uppdatera', {
    name: person.name,
    email: person.email,
    phonenumber: person.phonenumber,
    strength: person.strength,
    id: person._id
  })
})

app.post('/uppdatera/:id', async (req, res) => {
  await member.updateOne({_id:  ObjectId(req.params.id)}, {$set: {...req.body}})
  res.redirect('/medlemmar')
})

app.listen(port, () => console.log(`Listening to ${port}`))