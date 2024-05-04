const sendCommand = (port, parser, command) => {
    return new Promise((resolve, reject) => {
        port.write(`${command}\n`, (err) => {
            if (err) {
                reject(err);
            }
        });

        parser.once('data', (data) => {
            resolve(data.trim());
        });
    });
}

const queryDevice = async (port, parser) => {
    try {
        // const devEUI = await sendCommand(port, parser, 'ATC+LORAWAN_DEVEUI=?');
        // const appKey = await sendCommand(port, parser, 'ATC+LORAWAN_APPKEY=?');
        // const bleMac = await sendCommand(port, parser, 'ATC+BLE_MAC=?');

        // const appEUI = await sendCommand(port, parser, 'ATC+LORAWAN_APPEUI=?');
        const devEUI = "111111111111111111"
        const appKey = "22222222222222222222222"
        const bleMac = "3333333333333333333333"
        const appEUI = "444444444444444444"
        return {
            devEUI,
            appKey,
            bleMac,
            appEUI
        }
    } catch (error) {
        return {
            error: "Querying Device Error"
        }
    }
}

module.exports = {
    queryDevice
}