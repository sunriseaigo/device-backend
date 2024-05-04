const express = require('express')

const app = express()

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

