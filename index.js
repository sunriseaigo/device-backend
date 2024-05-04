//import modules
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

//middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

//endpoints
app.get("/get_ports", async (req, res) => {
    const ports = await SerialPort.list()
    res.json(ports)
})

app.listen(8000, () => console.log("Server is running on port 8000..."))


const { SerialPort } = require('serialport')
const { MockBinding } = require('@serialport/binding-mock')

// Create a port and enable the echo and recording.
MockBinding.createPort('/dev/COM', { echo: true, record: true })
const port = new SerialPort({ binding: MockBinding, path: '/dev/COM', baudRate: 14400, autoOpen: false, })

const { ReadlineParser } = require('@serialport/parser-readline');
const parser = new ReadlineParser()

port.open((err) => {
    if (err) {
        console.error('Failed to open port:', err);
    } else {
        console.log('Mock Port Opened');

        // Simulate sending data to the port
        port.port.emitData('DevEUI=1234567890ABCDE\n');
    }
});


port.pipe(parser).on('data', line => {
    console.log(line.toUpperCase())
})

