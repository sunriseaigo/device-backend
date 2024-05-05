const Ptouch = require('node-ptouch');
const net = require('net');

// Function to send a data to the printer
const printData = (res, data, address) => {
    const ptouch = new Ptouch(1, { copies: 1 });

    ptouch.insertData('deveui_text', data.devEUI);
    ptouch.insertData('deveui_barcode', data.devEUI);

    ptouch.insertData('appkey_text', data.appKey);
    ptouch.insertData('appkey_barcode', data.appKey);

    ptouch.insertData('blemac_text', data.bleMac);
    ptouch.insertData('blemac_barcode', data.bleMac);

    ptouch.insertData('appeui_text', data.appEUI);
    ptouch.insertData('appeui_barcode', data.appEUI);

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
                error: `Print Write Error: ${err}`
            })
        }
        socket.write(printData, function (err) {
            if (err) {
                return res.json({
                    success: false,
                    error: `Print Write Error: ${err}`
                })
            }
            return res.json({
                success: true,
            })
            socket.destroy();
        });
    });
    socket.on('error', (err) => {
        return res.json({
            success: false,
            error: `Print Write Error: ${err}`
        })
    })
}

// Function to send a command to the device and handle the response
const sendCommand = (port, command) => {
    port.write(`${command}\n`, (err) => {
        if (err) {
            console.log(err)
        }
    });
}

// Function to query the device for DevEUI, AppKey, BLE MAC, and AppEUI
async function queryDevice(port, res) {
    try {
        sendCommand(port, 'ATC+LORAWAN_DEVEUI=?');
        sendCommand(port, 'ATC+LORAWAN_APPKEY=?');
        sendCommand(port, 'ATC+BLE_MAC=?');
        sendCommand(port, 'ATC+LORAWAN_APPEUI=?');
    } catch (error) {
        return res.json({
            success: false,
            error: `Error querying device: ${error}`
        })
    }
}

module.exports = {
    printData,
    queryDevice
}