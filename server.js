const express = require('express');
const serveStatic = require("serve-static")
const path = require('path');
app = express();
app.use(serveStatic(path.join(__dirname, 'dist')));
const port = process.env.PORT || 80;
app.listen(port);

/* OSC Communication */

// const OSC = require('osc-js')
//
// const config = { udpClient: { port: 4000 } }
// const osc = new OSC({ plugin: new OSC.BridgePlugin(config) })
//
// osc.open();
