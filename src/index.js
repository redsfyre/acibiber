const TelegramBot = require('node-telegram-bot-api');
const token = '';
const bot = new TelegramBot(token, { polling: true });
const fs = require('fs');
const express = require('express');
const app = express();
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const karaListe = require('../karaliste.json')
const kali = 'kali';

db.defaults({
  users: [],
}).write();

app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function(req, res) {
  var result = 'App is running'
  res.send(result);
}).listen(app.get('port'), function() {
  console.log('App is running, server is listening on port ', app.get('port'));
});

bot.onText(/\/start/, (msg) => {
	bot.sendMessage(msg.chat.id, "Sen yeter ki başlamak iste :)");
});

function checkWord(word, str) {
  const allowedSeparator = '\\\s,;"\'|';
  const regex = new RegExp(
    `(^.*[${allowedSeparator}]${word}$)|(^${word}[${allowedSeparator}].*)|(^${word}$)|(^.*[${allowedSeparator}]${word}[${allowedSeparator}].*$)`, 'i',
  );
  return regex.test(str);
}

bot.on("message", (msg) => {
    fs.readFile('./karaliste.json', 'utf8', function (err, data) {
      data = JSON.parse(data);
      for(var i = 0; i < data.length; i++) {
        if( checkWord(data[i], msg.text)) {
          bot.deleteMessage(msg.chat.id,  msg.message_id);
          bot.sendMessage(msg.chat.id, "Ağzına acı biber sürerim senin " + msg.from.first_name + "!" + " Yanlışlık olduğunu düşünüyorsan şu komutu çalıştır ve listedekilerden biriyle iletişime geç: \n/adminlist@MissRose_bot \n(id: " + "<code>" + msg.from.id + "</code>" + ")",{parse_mode : "HTML"});
          break;
        }
      }
   });
});

bot.onText(/\/nuke/, (msg) => {
	bot.sendVideo(msg.chat.id,"https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif",{caption : "Umarım 18 megatonluk atom bombamı beğenirsiniz"} );
});

bot.onText(/\/supahotfire/, (msg) => {
  bot.sendVideo(msg.chat.id,"https://media.giphy.com/media/Aff4ryYiacUO4/giphy.gif",{caption : "ǝɹᴉɟʇoɥɐdns"} );
});

bot.on('polling_error', (err)=>{
	console.log(err); // =>'EFATAL'
});

bot.on('uncaughtException', (error) => {
  console.log("NODE_CODE:",error.code);
  console.log("MSG:",error.message);
  console.log("STACK:",error.stack);
});

bot.on('message', (msg, req, res) => {
  if (checkWord('kali', msg.text)) {

    var userid = msg.from.id;

    if (db.get('users').find({ id: userid }).value() !== undefined) {
      var mevcutCountjson = db.get('users').find({ id: userid }).value();
      console.log(mevcutCountjson);
      var mevcutCount = mevcutCountjson.count;

      var yazilacakCount = mevcutCount + 1;
      db.get('users').find({ id: userid }).assign({ count: yazilacakCount }).write();

      if (mevcutCount == 1) {

        bot.getChatMember(msg.chat.id, msg.from.id).then(function(data) {
          if ((data.status == "creator") || (data.status == "administrator")){
            bot.sendMessage(msg.chat.id, "Sen adminsin, kendine gel!")
          }else{
            bot.kickChatMember(msg.chat.id, msg.from.id);
            bot.sendMessage(msg.chat.id, 'SAYIN ' + (msg.from.first_name).toUpperCase() +", BANLANDINIZ!\n(id: " + "<code>" + msg.from.id + "</code>" + ")",{parse_mode : "HTML"});

          }
        })

        db.get('users').remove({ id: userid }).write();
      }
    } else {
      db.get('users')
        .push({ id: userid, count: 1 })
        .write()
        bot.sendMessage(msg.chat.id, 'Bir daha k*li dersen banlarım.\nİmza: acıbiber');
    }
  }
});
