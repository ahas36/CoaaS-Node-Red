/**
 * Created by ali on 4/03/2017.
 */
"use strict";

var request = require('request');

module.exports = function (RED) {
    function CoaaSNode(config) {
        RED.nodes.createNode(this, config);
        if (config.address.endsWith("/"))
        {
            this.address = config.address;
        } else
        {
            this.address = config.address + "/";
        }

        var node = this;
        var counter = 0;

        this.on('input', function (msg) {

            node.log(msg.topic);
            var cdqlMsg = "";
            var opts = {};
            node.log(this.address + "CommunicationManager/rest/api/cm/" + encodeURI(cdqlMsg));
            switch (msg.topic)
            {
                case "query":
                    counter++;
                    cdqlMsg = msg.payload;
                    var contentLength = Buffer.byteLength(cdqlMsg);

                    opts = {
                        method: "POST",
                        url: this.address + "CommunicationManager/rest/api/cm",
                        timeout: 1200000,
                        headers: {
                            'Content-Length': contentLength,
                            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImlzcyI6ImNvYWFzX3NlY3VyaXR5IiwiaWF0IjoxNTE1NzM0ODk5LCJleHAiOjE1NDcyNzA4OTl9.8bzQsA9Nn4KM9AdxVtLSyM6VMZf9_YZhNKtIGBmc75-ILp21pOp0q53-8MEn5XYDtaLkMliiOTv-DQ_BhYe8dg'
                        },
                        body: cdqlMsg
                    };
                    msg.topic = "query";
                    break;
                case "csr":
                    opts = {
                        method: "GET",
                        url: this.address + "sr/" + msg.payload.cpName + "/" + msg.payload.etype + "/" + encodeURI(msg.payload.cdql),
                        timeout: 1200000,
                        headers: {}
                    };

                    node.warn(this.address + "sr/" + msg.payload.cpName + "/" + msg.payload.etype + "/" + encodeURI(msg.payload.cdql));
                    break;
                case "clear":
                    opts = {
                        method: "GET",
                        url: this.address + "clear",
                        timeout: 1200000,
                        headers: {}
                    };
                    node.warn(this.address + "clear");
                    break;
            }


            //  opts.body = cdqlMsg;
            //  opts.headers['content-type'] = "application/json";

            request(opts, function (error, response, body) {
                node.status({});
                if (error) {
                    if (error.code === 'ETIMEDOUT') {
                        node.error(RED._("common.notification.errors.no-response"), msg);
                        setTimeout(function () {
                            node.status({
                                fill: "red",
                                shape: "ring",
                                text: "common.notification.errors.no-response"
                            });
                        }, 10);
                    } else {
                        node.error(error, msg);
                        msg.payload = error.toString() + " : " + url;
                        msg.statusCode = error.code;
                        node.send(msg);
                        node.status({
                            fill: "red",
                            shape: "ring",
                            text: error.code
                        });
                    }
                } else {
                    node.log(msg);
                    msg.payload = body;
                    msg.headers = response.headers;
                    msg.statusCode = response.statusCode;
                    try {
                        msg.payload = JSON.parse(msg.payload).body;
                    } catch (e) {
                        node.warn(RED._("httpin.errors.json-error"));
                    }
                    msg.query=cdqlMsg;
                    msg.layer = counter;
                    node.send(msg);
                }
            });


        });
    }
    RED.nodes.registerType("CoaaS", CoaaSNode);
}
