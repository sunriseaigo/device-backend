const Ptouch = require('node-ptouch');
const net = require('net');

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
}

module.exports = {
    printData
}