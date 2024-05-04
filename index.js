//import modules
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline');

//global variable
let devEuiString = "";
let appEuiString = "";
let appKeyString = "";
let bleMacString = "";

//create instance
const app = express()

//utils
const { printData } = require('./utils')

//middleware
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

//endpoints
app.get("/get_ports", async (req, res) => {
    const ports = await SerialPort.list()
    res.json(ports)
})

app.post("/handle_connect", async (req, res) => {
    const { com, rate } = req.body;
    const baudRate = rate - "0";

    const port = new SerialPort({
        path: com,
        baudRate: baudRate,
        autoOpen: false,
    })

    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

    // wait for port to open...
    port.open((err) => {
        if (err) {
            return res.json({
                success: false,
                error: "Device Connection Error"
            })
        }
    });

    parser.on('data', function (data) {
        const stringData = data.split('=');
        if (stringData[0] === "ATC+LORAWAN_DEVEUI") {
            devEuiString = stringData[1];
        }
        if (stringData[0] === "ATC+LORAWAN_APPEUI") {
            appEuiString = stringData[1];
        }
        if (stringData[0] === "ATC+LORAWAN_APPKEY") {
            appKeyString = stringData[1];
        }
        if (stringData[0] === "ATC+BLE_MAC") {
            bleMacString = stringData[1];
        }

        if (devEuiString && appEuiString && appKeyString && bleMacString) {
            res.json({
                devEUI: devEuiString,
                appEUI: appEuiString,
                appKey: appKeyString,
                bleMac: bleMacString,
                success: true,
            })
            devEuiString = "";
            appEuiString = "";
            appKeyString = "";
            bleMacString = "";
        }
    })
})

app.post("/print", async (req, res) => {
    const { data, address } = req.body;
    printData(res, data, address)
})

app.listen(8000, () => console.log("Server is running on port 8000..."))