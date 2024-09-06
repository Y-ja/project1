const express = require('express');
const app = express();
const path = require('path');
const SerialPort = require('serialport').SerialPort;

// SerialPort 설정
const sp = new SerialPort({
  path: 'COM3', // 실제 포트로 수정해야 합니다.
  baudRate: 9600
});

const port = 3000;

// 라우트 정의
app.get('/set/:position', (req, res) => {
  const position = req.params.position;
  let command = '';

  switch (position) {
    case '0':
      command = '1';
      break;
    case '45':
      command = '2';
      break;
    case '90':
      command = '3';
      break;
    case '135':
      command = '4';
      break;
    case '180':
      command = '5';
      break;
    default:
      return res.status(400).send('잘못된 위치입니다.');
  }

  sp.write(command, (err) => {
    if (err) {
      console.error('Write 오류: ', err.message);
      return res.status(500).send('서보 모터 이동 오류');
    }
    console.log(`서보 모터 ${position}도로 이동 명령 전송됨`);
    res.send(`서보 모터 ${position}도로 이동`);
  });
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 서버 시작
app.listen(port, () => {
  console.log(`포트 ${port}에서 대기 중`);
});
