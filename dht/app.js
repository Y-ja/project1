const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

// 최신 SerialPort 가져오기
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const sp = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
});

const parser = sp.pipe(new ReadlineParser({ delimiter: '\r\n' }));

sp.on('open', () => console.log('Port open'));

let ledStatus = "";
let temp = null;  // 온도 변수를 선언
let humi = null;  // 습도 변수를 선언

parser.on('data', function (data) {
  const rcv = data.toString().trim();

  // LED 상태 처리
  if (rcv.substring(0, 3) === 'led') {
    ledStatus = (rcv.substring(3, 4) === "1") ? "on" : "off";
    console.log('LED status: ' + ledStatus);
    io.emit('led', ledStatus);
  }

  // ADC 데이터 처리
  if (rcv.substring(0, 3) === 'adc') {
    const adc = parseInt(rcv.substring(3));
    console.log('ADC:', adc);
    io.emit('adc', adc);
  }

  // 온도 데이터 처리
  if (rcv.substring(0, 4) === 'temp') {
    temp = parseFloat(rcv.substring(4));
    console.log('Temperature:', temp);
    io.emit('temp', temp);
  }

  // 습도 데이터 처리
  if (rcv.substring(0, 4) === 'humi') {
    humi = parseFloat(rcv.substring(4));
    console.log('Humidity:', humi);
    io.emit('humi', humi);
  }
});

app.get('/led_on', function (req, res) {
  sp.write('led1\n\r', function (err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('Send: LED ON');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('LED ON\n');
  });
});

app.get('/led_off', function (req, res) {
  sp.write('led0\n\r', function (err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('Send: LED OFF');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('LED OFF\n');
  });
});

app.use(express.static(__dirname + '/public'));

const port = 3000;
http.listen(port, function () {
  console.log('Server listening on http://localhost:' + port);
});
