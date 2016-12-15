'use strict'

const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const http = require('http')
const request = require('request')

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

const port = process.env.PORT

const examples = [
  'osrf/cloudsim-auth',
  'osrf/cloudsim-badges',
  'osrf/cloudsim-sim',
  'osrf/cloudsim-portal',
  'osrf/cloudsim-keys',
  'osrf/cloudsim-grant',
  'osrf/cloudsim-widgets',
  'osrf/gazebo',
  'ignitionrobotics/ign-math'
]

examples.sort()

app.get('/', function (req, res) {

  let badges = ''

  for (let i in examples) {
    const project = examples[i]
    const href = '/badges/bitbucket/' + project + '/pulls.svg'
    badges += '<div><br>'
    badges += '<img src="' + href + '"></img>'
    badges += '<a href="' + href +'">' + href + '</a>'
    badges += '</div>\n'
  }

  const s = `
    <h1>Badges server</h1>
    <h2>Example Badges</h2>
    ${badges}
  `
  res.end(s)
})

// Get svg
app.get('/badges/bitbucket/:org/:repo/pulls.svg', function(req, res) {

  const url = 'https://bitbucket.org/!api/2.0/repositories/'
    + req.org + '/' + req.repo + '/pullrequests'

  request(url, function (error, response, body) {
    if (error) {
      console.error(error)
      return
    }
    if (response.statusCode != 200) {
      console.error('error getting PRs, code:', response.statusCode)
      res.status(response.statusCode).end(error)
      return
    }
    const bitbucketData = JSON.parse(body)
    const pullRequests = bitbucketData.size

    let color = '#4c1'
    if (pullRequests > 0)
      color = '#dfb317'

    const s = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="20"><linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><mask id="a"><rect width="128" height="20" rx="3" fill="#fff"/></mask>
<g mask="url(#a)"><path fill="#555" d="M0 0h81v20H0z"/><path fill="${color}" d="M81 0h47v20H81z"/><path fill="url(#b)" d="M0 0h128v20H0z"/></g><g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
<text x="40.5" y="15" fill="#010101" fill-opacity=".3">pull requests</text>
<text x="40.5" y="14">pull requests</text>
<text x="103.5" y="15" fill="#010101" fill-opacity=".3">${pullRequests} open</text>
<text x="103.5" y="14">${pullRequests} open</text>
</g></svg>`
    console.log('', pullRequests, 'open PRs for', req.org, '/', req.repo)
    // serve it as an svg document
    res.setHeader('content-type', 'image/svg+xml;charset=utf-8')
    res.end(s)
  })
})

// Set org parameter
app.param('org', function(req, res, next, id) {
  req.org = id
  next()
})

// Set repo parameter
app.param('repo', function(req, res, next, id) {
  req.repo = id
  next()
})

 // start the server
httpServer.listen(port, function(){
 console.log('listening on *:' + port)
})

