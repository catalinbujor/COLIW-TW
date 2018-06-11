let request = require('request');
const config = require('./config');
global.instagram = {};

exports.lets_verify = function (verifier) {
    request.post({
        url: 'https://api.instagram.com/oauth/access_token', form: {
            redirect_uri: 'http://localhost:3000/instagram/callback',
            client_id: config.instagram_api_key,
            client_secret: config.instagram_api_secret,
            code: verifier,
            grant_type: 'authorization_code'
        }
    }, function (err, httpResponse, body) {

        var acces_token = (JSON).parse(body);
        global.instagram.acces = acces_token.access_token;

    })
};

exports.getUserInformation = function getUser(req, res) {

    if(global.instagram.acces === undefined) // check for auth status
    {
        let data={status:3};
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
        return;
    }
    var url = "https://api.instagram.com/v1/users/self/?access_token=" + global.instagram.acces;
    request.get(url, function (error, response) {

            if(error !== null)
            {
                let data={status:2};
                data = JSON.stringify(data);
                res.writeHead(200, {"content-type": "application/json"});
                res.end(data);
                return;
            }
            let data = JSON.parse(response.body);
            let atribute = "";
            for (var property in data.data) {
                let value = `${data.data[property]}`;
                let propertyName=`${property}`;

                console.log(propertyName);

                if (propertyName != 'counts' && propertyName != 'is_business' && propertyName != 'id') {
                    atribute += propertyName.toUpperCase()+ ":  " + value;
                    atribute += '\n\n\n';
                }
            }

            for (var property in data.data.counts) {
                let value = `${data.data.counts[property]}`;
                let propertyName=`${property}`;
                if(propertyName === "media")
                {
                    atribute += "POSTS :"   + value;
                    atribute += '\n\n\n';
                }
                else {
                    atribute += propertyName.toUpperCase() + ":  " + value;
                    atribute += '\n\n\n';
                }

            }


            let infoDetails = JSON.stringify({"data": atribute});

            res.writeHead(200, {"content-type": "application/json"});
            res.end(infoDetails);
    })}






