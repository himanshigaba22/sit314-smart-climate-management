const tls = require('tls');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'aws_certs');

const options = {
  host: 'a1iu7amqiyldcv-ats.iot.us-east-1.amazonaws.com',
  port: 8883,
  key: fs.readFileSync(path.join(certsDir, 'private-key.pem.key')),
  cert: fs.readFileSync(path.join(certsDir, 'device-certificate.pem.crt')),
  ca: fs.readFileSync(path.join(certsDir, 'AmazonRootCA1.pem')),
};

const socket = tls.connect(options, () => {
  console.log('TLS handshake successful. Authorized:', socket.authorized);
  if (!socket.authorized) {
    console.log('Authorization error:', socket.authorizationError);
  }
  socket.end();
});

socket.on('error', (err) => {
  console.error('TLS error:', err);
});

socket.setTimeout(8000, () => {
  console.log('Socket timed out with no response');
  socket.destroy();
});
