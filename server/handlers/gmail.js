
const TOKEN_PATH = 'credentials.json';

const {google} = require('googleapis');


let map = [];


let messages_list = [];

const oauth2Client = new google.auth.OAuth2(
    "469705344501-k7053ffpbekmr08pfgcvdti0v1dd9vhr.apps.googleusercontent.com",
  "U_Magj7fVOj5AjVGJHO_-BMf",
  "http://localhost:3000/gmail/auth"
  );

  // generate a url that asks permissions for Google+ and Google Calendar scopes
  const scopes = [
    'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://mail.google.com/'
  ];

  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // If you only need one scope you can pass it as a string
    scope: scopes
  });

let fs = require('fs');

module.exports = {

    label_map : map,

  oauth2Client : oauth2Client,
  url : url,
  setToken : async function(code)
  {

  console.log("Token code !!! "+code);
  
  //const {tokens} = await oauth2Client.getToken(code);

  //console.log('BINEEEEEEEEE');
  //oauth2Client.setCredentials(tokens);
   oauth2Client.getToken(code, (err, token) => {
    if (err) return console.log('Eroare token google');
    oauth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      console.log('Token stored to', TOKEN_PATH);
    });
  });

  },
  
/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

listLabels : function (auth,req,res)  {
    return new Promise(resolve => {
        if(auth.credentials['access_token']==null)
        {
            //console.log("In listLabels  "+JSON.stringify(auth));
            let data2 = JSON.stringify({
                "data": 'Logheaza-te cu contul de google pentru a continua'
            });
            if(res) {
                res.writeHead(200, {"content-type": "application/json"});
                res.end(data2);
            }
            resolve();
            return;
        }
    console.log("In listLabels  "+JSON.stringify(auth));
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, {data}) => {
    if (err) return console.log('The API returned an error: ' + err);
    let labels_list = "";
    const labels = data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
       // console.log(`- ${label.name}`);
        map[label.name]=label.id;
        labels_list += ` ${label.name} \n\r`;
      });
    } else {
        labels_list='No labels found.';
        console.log('No labels found.');
    }
      let data2 = JSON.stringify({
          "data": labels_list
      });
    if(res) {
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data2);
    }
      console.log('Aici in gmail.js la res.end');
      resolve(labels_list);
  });
    })
},

listMessages : function (auth,req,res,keyword,labels,date){
    messages_list=[];
    return new Promise(resolve => {
            if(auth.credentials['access_token']==null)
            {
                let data2 = JSON.stringify({
                    "data": 'Logheaza-te cu contul de google pentru a continua'
                });
                res.writeHead(200, {"content-type": "application/json"});
                res.end(data2);
                resolve("OK");
                return ;
            }
            const gmail = google.gmail({version: 'v1', auth});
            let query = "";
            if(date && keyword)
                query = keyword + ' and '+date;
            else query = keyword+date;
            // if(date)
            //     keyword+= ' and '+date;
            gmail.users.messages.list({
                'userId': 'me',
                q : query,
                labelIds : labels
            }, (err, response) => {
            if (err) {
                let data2 = JSON.stringify({
                    "data": 'No messages found! Try another query'
                });
                res.writeHead(200, {"content-type": "application/json"});
                res.end(data2);
                return console.log('No messages found ');
            }
            if(response === undefined)
            {
                console.log('No messages found');
            }
            let mess_list = "";

            const messages = response.data.messages;

            if (messages.length) {

                messages.forEach((message) => {
                    //console.log(`- - ${message.id}`);
                    mess_list += ` ${message.id} \n\r`;
                    messages_list.push(message.id);
                });
            } else {
                mess_list = 'No labels found.';
                console.log('No labels found.');
            }
            let data2 = JSON.stringify({
                "data": mess_list
            });
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data2);
            resolve(messages_list);
            //console.log('Aici in gmail.js la res.end la messages list');
        })
            })
    },

    getMessage : function (auth,idMessage)  {
        return new Promise(resolve => {
            const gmail = google.gmail({version: 'v1', auth});
            gmail.users.messages.get({
                userId: 'me',
                id : idMessage
            }, (err, {data}) => {
                if (err) return console.log('The API returned an error: ' + err);
                resolve(data);
            });
        })
    },

    parseMessage : function(fullMessage_){
        return new Promise(resolve => {
            //console.log("FULL "+JSON.stringify(fullMessage_));
            let atob = require('atob');

         let compressed_message = {
                        'snippet':fullMessage_.snippet,
                        'base':atob(fullMessage_.payload.body.data),
                        'deliveredTo':fullMessage_.payload['headers'][20].value,
                        'subject':fullMessage_.payload['headers'][19].value,
                        'data':fullMessage_.payload['headers'][17].value,
                        'from':fullMessage_.payload['headers'][16].value
                    };
         resolve(compressed_message);
        });
    },

    readFromFile : function(filename){
    return new Promise(resolve => {
        fs.readFile(filename, 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            resolve(data);
        });
    });
    },

    parseAllMessages: function(req,res,obj){
        return new Promise(resolve => {
            let html_resultat='';

            module.exports.readFromFile('.//..//css//htmlmockup').then(function(htmlmock){
                html_resultat = htmlmock;
                module.exports.listLabels(module.exports.oauth2Client,null,null).then(function(){
                    let hashed_labels =[];
                    if(obj.labels.length > 0)
                    {
                        for(var i=0;i<obj.labels.length;i++)
                            hashed_labels.push(exports.label_map[obj.labels[i]]);
                    }
                    else hashed_labels = obj.labels;
                    //  console.log('Hashed '+hashed_labels);

                    var listate = module.exports.listMessages(module.exports.oauth2Client,req,res,obj.keyword,hashed_labels,obj.date);//'pisica',[],'after:2018/06/07');
                    listate.then(function(messages){
                        if(messages) {
                            //console.log("messages "+messages);

                            for(var i=0;i<messages.length;i++)
                            {
                                //console.log('ID '+messages[i]);
                                var mesaj = module.exports.getMessage(module.exports.oauth2Client,messages[i]);
                                mesaj.then(function (mesajRez) {
                                    //console.log(JSON.stringify(mesajRez));
                                    let compresat = module.exports.parseMessage(mesajRez);
                                    compresat.then(function(msgcompresat){

                                    html_resultat+='<div>\n';
                                    html_resultat+='<h2 id = "inner"> Subject:<b>'+msgcompresat.subject+'</b></h2>';
                                    html_resultat+='</div>\n';

                                    html_resultat+='<div>\n';
                                    html_resultat+='<p id = "inner"> Data:<i>'+msgcompresat.data+'</i></p>';
                                    html_resultat+='</div>\n';

                                    html_resultat+='<div>\n';
                                    html_resultat+='<p id = "inner"> From :<i>'+msgcompresat.from+'</i></p>';
                                    html_resultat+='</div>\n';

                                    html_resultat+='<div>\n';
                                    html_resultat+='<p id = "inner"> Delivered to :<i>'+msgcompresat.deliveredTo+'</i></p>';
                                    html_resultat+='</div>\n';

                                    html_resultat+='<div>\n';
                                    html_resultat+='<p id = "actualmessage">'+msgcompresat.base+'</p>';
                                    html_resultat+='</div>\n';

                                    html_resultat+='<div>\n';
                                    html_resultat+='<p id = "actualmessage">'+'---------------------'+'</p>';
                                    html_resultat+='</div>\n';
                                    })


                                });

                            }



                        }
                    })
                });

            });
        });



    },

auth : function (req, res) {
    let oauth = oauth2Client
    ;
        let data = JSON.stringify({
            "uri": url
        });
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
        //console.log('Aici in gmail.js');
}

}


