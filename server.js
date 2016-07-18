var ejs = require('ejs'),
    read = require('fs').readFileSync,
    http = require("http"),
    request = require("request"),
    cheerio = require('cheerio');
var server = http.createServer(function(req, res) {

    var allTitles = [];
    var allPaths = [];
    var main_url = req.url;
    var path = main_url.substring(0, 14);
    if (path === "/I/want/title/") {
        var address = main_url.substring(14, main_url.length);

        if (address[0] === "?") {
            address = address.substring(1, address.length);

            address = address.split("&");
            var http_prefix = "http://";
            var www_prefix = "www.";
            getTitles(address[0], 0, address.length - 1, getTitles); //callback function -- getTitles in last parameter

            function getTitles(addr, count, addrLength, callback) {
                var fetch_path = addr.substring(0, 8);

                if (fetch_path === "address=") {
                    fetch_path = addr.substring(8, addr.length);
                    allPaths.push(fetch_path);
                    if (fetch_path.substr(0, www_prefix.length) !== www_prefix) {
                        fetch_path = www_prefix + fetch_path;
                    }
                    if (fetch_path.substr(0, http_prefix.length) !== http_prefix) {
                        fetch_path = http_prefix + fetch_path;
                    }
                    request(fetch_path, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var $ = cheerio.load(body);
                            var title = $("title").text();
                            allTitles.push(title);
                            if (count == addrLength) {
                                res.end(ejs.render(read('views/index.ejs', 'utf-8'), {
                                    addresses: allPaths,
                                    allTitles: allTitles
                                }));
                                return;
                            }
                            callback(address[count + 1], count + 1, addrLength, getTitles);
                        } else if (error) {
                            allTitles.push("NO RESPONSE");
                            if (count == addrLength) {
                                res.end(ejs.render(read('views/index.ejs', 'utf-8'), {
                                    addresses: allPaths,
                                    allTitles: allTitles
                                }));
                                return;
                            }
                            callback(address[count + 1], count + 1, addrLength, getTitles);
                        }
                    });

                } else {
                    res.writeHead(404);
                    res.end(ejs.render(read('views/error.ejs', 'utf-8')));
                }

            }


        } else {
            res.writeHead(404);
            res.end(ejs.render(read('views/error.ejs', 'utf-8')));
        }
    } else {
        res.writeHead(404);
        res.end(ejs.render(read('views/error.ejs', 'utf-8')));
    }

});



server.listen(3000);

console.log("Server listening on port 3000....");