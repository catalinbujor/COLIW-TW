
// url = "http://adevarul.ro/rss/"; // asta e async apelezi odata nu apela imediat compute_json pana nu scrie xmlu:)))
// XmlService.fetch_data_from_url(url,)

// word = "ban"
// setTimeout(()=>XmlService.compute_json_by_word(word), 1000);

let Parser = require('rss-parser');

let parser = new Parser();

let rss_map = [];
rss_map['cnn']='http://rss.cnn.com/rss/cnn_topstories.rss';
rss_map['reddit']='https://www.reddit.com/.rss';
rss_map['news.ro']='https://www.news.ro/rss';
rss_map['sport.ro']='https://www.sport.ro/rss';

exports.parseRSS= function(url1,ulr2,cb,tag){
    (async () => {

        let feed = await parser.parseURL('https://www.sport.ro/rss');//'https://www.reddit.com/.rss');
        let feed2 = await parser.parseURL('https://www.reddit.com/.rss');
        console.log(feed.title);
        let array=[];
        let result='';
        feed = feed.items.filter(item => item.title.indexOf(tag) > 0).map(item => {
            return {
              "title": item.title,
              "pubData": item.pubDate,
              "link": item.link
            };
        });
       feed2 = feed2.items.filter(item => item.title.indexOf(tag) > 0).map(item => {
            return {
                "title": item.title,
                "pubData": item.pubDate,
                "link": item.link
            };
        });
    let html_res='<html><body>';

        for(let i = 0; i < feed.length; ++i) {
            html_res+='<div>\n';
            html_res+='<h2>Title : '+feed[i].title+'</h2>';
            html_res+='</div>\n';

            html_res+='<div>\n';
            html_res+='<p> Date : '+feed[i].pubData+'</p>';
            html_res+='</div>\n';

            html_res+='<div>\n';
            html_res+=`<p> <a href=`+feed[i].link +'> '+feed[i].link+'</a> </p>';
            html_res+='</div>\n';

        }
        for(let i = 0; i < feed2.length; ++i) {
            html_res+='<div>\n';
            html_res+='<h2>Title : '+feed2[i].title+'</h2>';
            html_res+='</div>\n';

            html_res+='<div>\n';
            html_res+='<p> Date : '+feed2[i].pubData+'</p>';
            html_res+='</div>\n';

            html_res+='<div>\n';
            html_res+=`<p> <a href=`+feed2[i].link +'> '+feed2[i].link+'</a> </p>';
            html_res+='</div>\n';


        }
    console.log(html_res);
        var fs = require('fs');
        fs.writeFile("./flux.rss", html_res, function(err) {
            if(err) {
                cb(err);
                return console.log(err);
            }
            cb();
        });
    })();
};
//module.exports.parseRSS(null,null,null,'FCSB');