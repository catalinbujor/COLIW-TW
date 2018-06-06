
const TOKEN_PATH = 'credentials.json';

const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    "469705344501-k7053ffpbekmr08pfgcvdti0v1dd9vhr.apps.googleusercontent.com",
  "U_Magj7fVOj5AjVGJHO_-BMf",
  "http://localhost:3000/gmail/auth"
  );

  // generate a url that asks permissions for Google+ and Google Calendar scopes
  const scopes = [
    'https://www.googleapis.com/auth/gmail.modify'
  ];

    
  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // If you only need one scope you can pass it as a string
    scope: scopes
  });

module.exports = { 

  oauth2Client : oauth2Client,
  url : url,
  setToken : async function(code)
  {
  console.log("Token code !!! "+code);
  
  const {tokens} = await oauth2Client.getToken(code);

  console.log('BINEEEEEEEEE');
  oauth2Client.setCredentials(tokens);
   // oauth2Client.getToken(code, (err, token) => {
  //   if (err) return callback(err);
  //   oauth2Client.setCredentials(token);s
  //   // Store the token to disk for later program executions
  //   fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
  //     if (err) return console.error(err);
  //     console.log('Token stored to', TOKEN_PATH);
  //   });
  // });

  },
  
/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

listLabels : function (auth,req,res)  {
    return new Promise(resolve => {
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
        console.log(`- ${label.name}`);
        labels_list += ` ${label.name} \n\r`;
      });
    } else {
        labels_list='No labels found.';
        console.log('No labels found.');
    }
      let data2 = JSON.stringify({
          "data": labels_list
      });
      res.writeHead(200, {"content-type": "application/json"});
      res.end(data2);
      console.log('Aici in gmail.js la res.end');
      resolve(labels_list);

  });
    })
},

auth : function (req, res) {
    let oauth = oauth2Client
    ;
        let data = JSON.stringify({
            "uri": url
        });
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
        console.log('Aici in gmail.js');
}

}


