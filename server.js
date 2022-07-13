let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

let numberRandomClient = {};

io.on('connection', (socket) => {
    
    io.clients((error, clients) => {    
        if (error) throw error;
        console.log(clients);
    });

    socket.on('enterRoom', function(room, length) {
        let bonusTypes = [5, 10, 20, 50, 100] , numberRandom = getRndInteger(0, length);
        socket.room = room;
        numberRandomClient[socket.id] = { 
            numberRandom : numberRandom,
            bonus : {}
        };
        for (let index = 0; index <= getRndInteger(0, 5, false); index++) {
            numberRandomClient[socket.id].bonus[index] = { location : getRndInteger(0, length, numberRandom), typeBonus : bonusTypes[getRndInteger(0, 5, false)] }
        }
        console.log(numberRandomClient[socket.id]);
        socket.join(room);
        var users= io.sockets.adapter.rooms[room].sockets;
        io.to(socket.room).emit('usersConnect',Object.keys(users).length)
        socket.emit('bonus', numberRandomClient[socket.id].bonus);
    });

    socket.on('sendMessageAll', (message) => {
        io.to(socket.room).emit('receiveMessageAll',message)
    });

    socket.on('disconnect', function() {
        delete numberRandomClient[socket.id];
    });

    socket.on("verifyClick", (clickNumber) => {
       if(clickNumber == numberRandomClient[socket.id].numberRandom){
           socket.emit('request', "Acertou",clickNumber);
       } 
       else{
        socket.emit('request', "Errou",clickNumber);
       }
    });

});

var port = process.env.PORT || 3001;

http.listen(port, function() {
    console.log('listening in http://localhost:' + port);
});

function getRndInteger(min, max, numberRandom) {
    let random = Math.floor(Math.random() * (max - min) ) + min;
    if(numberRandom == false){
        return random;   
    }
    else{
        if(random != numberRandom){
            return random;
        }
        else{
            getRndInteger();
        }
    }
}