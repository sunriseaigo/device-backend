//import modules
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { SerialPort } = require('serialport')
const { MockBinding } = require('@serialport/binding-mock')

const Ptouch = require('node-ptouch');
const net = require('net');

const ptouch = new Ptouch(1, { copies: 2 });

const app = express()
const { ReadlineParser } = require('@serialport/parser-readline');
const parser = new ReadlineParser()

//utils
const { queryDevice } = require('./utils')

//middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

//endpoints
app.get("/get_ports", async (req, res) => {
    const ports = await SerialPort.list()
    res.json(ports)
})

app.post("/handle_connect", async (req, res) => {
    const { com, rate } = req.body;
    const baudRate = rate - "0";

    MockBinding.createPort({ com }, { echo: true, record: true })
    const port = new SerialPort({ binding: MockBinding, path: { com }, baudRate: baudRate, autoOpen: false, })

    port.open((err) => {
        if (err) {
            res.json({
                success: false,
                error: "Device Connection Error"
            })
        } else {
            // Simulate sending data to the port
            queryDevice(port, parser)
                .then(result => res.json({ ...result, success: true }))
        }
    });
})

app.post("/print", async (req, res) => {
    const { data, address } = req.body;
    ptouch.insertData('DevEUI', data.devEUI);
    ptouch.insertData('AppKEY', data.appKey);
    ptouch.insertData('BLE MAC', data.bleMac);
    ptouch.insertData('AppEUI', data.appEUI);
    const printData = ptouch.generate();

    // send data to printer
    const socket = new net.Socket();
    socket.on('close', () => {
        console.log('Connection closed');
    });
    socket.connect(9100, address, (err) => {
        if (err) {
            return res.json({
                success: false,
                error: "Print Connect Error"
            })
        }
        socket.write(printData, function (err) {
            if (err) {
                return res.json({
                    success: false,
                    error: "Print Write Error"
                })
            }
            return res.json({
                success: true,
            })
            socket.destroy();
        });
    });
    socket.on('error', () => {
        return res.json({
            success: false,
            error: "Print Connect Error"
        })
    })

})

app.listen(8000, () => console.log("Server is running on port 8000..."))