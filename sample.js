const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
var Ptouch = require('node-ptouch');
var net = require('net');



let devEuiString = "";
let appEuiString = "";
let appKeyString = "";
let bleMacString = "";



const port = new SerialPort({
    path: 'COM4',
    baudRate: 115200,
    autoOpen: false,
})



const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))



port.open(function (err) {
    if (err) {
        return console.log('Error opening port: ', err.message)
    }
})



// The open event is always emitted
port.on('open', function () {
    // open logic
})



parser.on('data', function (data) {
    const stringData = data.split('=');

    console.log(stringData[0]);
    console.log(stringData[1]);

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



        console.log("SEND TO PRINTER!");
        // generate ptouch code



        var ptouch = new Ptouch(1, { copies: 1 }); // select template 1 for two copies
        ptouch.insertData('deveui_text', devEuiString);
        ptouch.insertData('deveui_barcode', devEuiString);



        ptouch.insertData('appeui_text', appEuiString);
        ptouch.insertData('appeui_barcode', appEuiString);



        ptouch.insertData('appkey_text', appKeyString);
        ptouch.insertData('appkey_barcode', appKeyString);



        ptouch.insertData('blemac_text', bleMacString);
        ptouch.insertData('blemac_barcode', bleMacString);



        var data = ptouch.generate();



        // send data to printer
        var socket = new net.Socket();
        socket.on('close', function () {
            console.log('Connection closed');
        });



        socket.connect(9100, '192.168.2.173', function (err) {
            if (err) {
                return console.log(err);
            }
            socket.write(data, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log('data sent');
                socket.destroy();
            });
        });



    }



})