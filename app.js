const express = require("express")
const app = express();
const basicAuth = require("./basicAuth")
const fs = require("fs");
const path = require("path")
const bodyParser = require('body-parser');

//const acceptedStudents = require("./acceptedNames.json")
let acceptedStudents = {}
let tries;

const names = require("./names")

fs.readFile("./database.json", (err, data) => {
  ({ ids: acceptedStudents, tries } = JSON.parse(data));
  //Initialize "database" with students from the original list
  //Shoul only happen ONCE
  if (Object.keys(acceptedStudents).length != names.length) {
    console.log("Initializing")
    names.forEach(name => {
      if (!acceptedStudents[name.id]) {
        acceptedStudents[name.id] = 0
      }
    })
    const data = { ids: acceptedStudents, tries }
    fs.writeFile("./database.json", JSON.stringify(data), (err, res) => {
      if (err) throw err
    })
  }
})

const saveStatus = (status) => {
  new Promise((resolve, reject) => {
    console.log("deleting", status)
    fs.writeFile("./database.json", JSON.stringify(status), (err, res) => {
      if (err) {
        reject(err)
      }
      resolve();
    })
  })
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(basicAuth);
app.use('/', express.static(path.join(__dirname, './public')));


app.get('/', (req, res) => res.end("<h2>Demo</h2>"));

app.get("/api/next-student", async (req, res) => {
  let name;
  //Check if any student have not yeat made a minimum of tries presentations
  let stillMissing = false;
  for (const s in acceptedStudents) {
    if (acceptedStudents[s] <= tries) {
      stillMissing = true;
    }
  }
  if (!stillMissing) {
    tries = tries + 1;
  }

  await saveStatus({ ids: acceptedStudents, tries })

  let foundStudent = false;
  while (!foundStudent) {
    const index = Math.floor(Math.random() * names.length);
    name = names[index];
    if (acceptedStudents[name.id] < tries) {
      foundStudent = true;
      acceptedStudents[name.id] = acceptedStudents[name.id] + 1
    }
  }
  res.json(name)
})



app.get("/api/presentation-status", (req, res) => {
  const status = names.map(name => {
    const student = { name: name.name, presentations: 0 }
    if (acceptedStudents[name.id]) {
      student.presentations = acceptedStudents[name.id];
    }
    return student;
  })
  const result = { tries, status }
  return res.json(result);
})

app.post("/api/student-accepted", async (req, res) => {
  const acceptedStudent = req.body;
  const id = acceptedStudent.id;
  acceptedStudents[id] = acceptedStudents[id] + 1
  const data = { ids: acceptedStudents, tries }
  await saveStatus(data);
  res.json({ status: "OK" })
})

app.post("/api/clear-all-presentations", async (req, res) => {
  for (const s in acceptedStudents) {
    acceptedStudents[s] = 0;
  }
  const data = { ids: acceptedStudents, tries }
  await saveStatus(data);
  console.log("CLEARED")
  res.json({ status: "All-Cleared" })
})

app.post("/api/increase-allowed-presentations", async (req, res) => {
  tries = tries + 1;
  const data = { ids: acceptedStudents, tries }
  await saveStatus(data);
  res.json({ tries })
})

app.listen(3333, () => console.log(`Server started, listening on port 3333`))