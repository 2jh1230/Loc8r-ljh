const mongoose = require('mongoose');
const readLine = require('readline');
mongoose.set("strictQuery", false); // strictQuery 설정

// MongoDB 연결 문자열
const dbPassword = process.env.REACT_APP_MONGODB_PASSWORD; // 환경변수에서 비밀번호 가져오기
const dbURI = `mongodb+srv://2jeonghwan1230:${dbPassword}@cluster0.btz9wir.mongodb.net/Loc8r`;

// MongoDB에 연결
mongoose.connect(dbURI)
  .then(() => console.log(`Mongoose connected to ${dbURI}`))
  .catch(err => console.log(`Mongoose connection error: ${err}`));

// 연결 이벤트 설정
mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbURI}`);
});

mongoose.connection.on('error', err => {
    console.log(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// graceful shutdown 처리
const gracefulShutdown = (msg, callback) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose disconnected through ${msg}`);
        callback();
    });
};

// nodemon 재시작 처리
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});

// 앱 종료 시 처리
process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0);
    });
});

// Heroku 앱 종료 시 처리
process.on('SIGTERM', () => {
    gracefulShutdown('Heroku app shutdown', () => {
        process.exit(0);
    });
});

// 추가적인 모델 불러오기
require('./locations');
require('./users');
