'use strict'

const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const http = require('http')

// cloudsim-specific
const csgrant = require('cloudsim-grant')

// the configuration values are set in the local .env file
// this loads the .env content and puts it in the process environment.
dotenv.load()

// The Cross-Origin Resource Sharing standard
app.use(cors())
// Populates the body of each request
app.use(bodyParser.json())
// prints all requests to the terminal
app.use(morgan('combined'))

const httpServer = http.Server(app)

const adminUser = process.env.CLOUDSIM_ADMIN
const db = 'grant-test'
const port = process.env.PORT

const resources = [
  {
    "name": "toasters",
    "data": {},
    "permissions": [
      {
        "username": adminUser,
        "permissions": {
          "readOnly": false
        }
      }
    ]
  }
]

const projects = ['cloudsim-auth',
  'cloudsim-badges',
  'cloudsim-sim',
  'cloudsim-portal',
  'cloudsim-keys',
  'cloudsim-grant',
  'cloudsim-widgets']



app.get('/', function (req, res) {
  const v = require('../package.json').version

  let badges = ''

  for (let i in projects) {
    const project = projects[i]
    const href = '/badges/pr/' + project + '/pulls.svg'
    badges += '<div><br>'
    badges += '<img src="' + href + '"></img>'
    badges += '<a href="' + href +'">' + href + '</a>'
    badges += '</div>\n'
  }

  const s = `
    <h1>Cloudsim badges server</h1>
    <pre>
    cloudsim-grant v${v}
    </pre>
    <h2>Badges</h2>
    ${badges}
  `
  res.end(s)
})

console.log('Setting up routes for bibucket PRs')
for (let i in projects) {
  const project = projects[i]
  const url = '/badges/pr/' + project + '/pulls.svg'
  const repo = 'osrf/' + project
  console.log('GET', url, ':', repo)
  app.get(url, csgrant.bitbucketBadgeOpenPrs(repo))
}



csgrant.setPermissionsRoutes(app)



csgrant.init(resources,
  db,
  'localhost',
  httpServer,
  (err)=> {
    if(err) {
      console.log('Error loading resources: ' + err)
      process.exit(-2)
    }
    else {
      console.log('resources loaded')

      // start the server
      httpServer.listen(port, function(){
        console.log('listening on *:' + port);
      })
    }
  }
)

 // start the server
httpServer.listen(port, function(){
 console.log('listening on *:' + port)
})

