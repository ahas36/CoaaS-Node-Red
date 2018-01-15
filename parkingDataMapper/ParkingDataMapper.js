/**
 * Created by ali on 4/03/2017.
 */
"use strict";

module.exports = function (RED) {
    function ParkingDataMapper(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.on('input', function (msg) {
            if (msg.topic === "query")
            {
                var msgs = [];
                var result = JSON.parse(msg.payload);
                var jsonObj = result.targetCarpark.carparks;
                var targetLoc = result.destinationLocation;

                var tmpMsg1 = {payload: {}};
                tmpMsg1.payload.lon = targetLoc.longitude;
                tmpMsg1.payload.lat = targetLoc.latitude;
                tmpMsg1.payload.radius = 1000;
                tmpMsg1.payload.name = "q" + msg.layer;
                tmpMsg1.payload.icon = "car";
                tmpMsg1.payload.iconColor = "blue";
                tmpMsg1.payload.query = msg.query;
                tmpMsg1.payload.layer = "l" + msg.layer;
                tmpMsg1.payload.command = {layer: "l" + msg.layer, lat: targetLoc.latitude, lon: targetLoc.longitude, zoom: 12};
                node.send(tmpMsg1);

                var isFirst = true;
                for (var x in jsonObj)
                {
                    var val = jsonObj[x];
                    var tmpMsg = {payload: {}};
                    tmpMsg.payload.name = val.name;
                    if (val.SQEM != null)
                    {
                        if (val.SQEM.cost != null)
                        {
                            tmpMsg.payload.cost = val.SQEM.cost;
                        }
                        if (val.SQEM.distance != null)
                        {
                            tmpMsg.payload.cost = val.SQEM.distance;
                        }
                    }
                    var capacity = val.capacity_mv_based;
                    var strCapacity = capacity[0].date.$date;
                    for (var c in capacity)
                    {
                        var cVal = capacity[c];
                        strCapacity += ",    " + cVal.intendedForUserGroup + "  :  " + cVal.currentValue;
                    }
                    tmpMsg.payload.capacity = strCapacity;
                    tmpMsg.payload.name = val.name;
                    tmpMsg.payload.lat = val.geo.latitude;
                    tmpMsg.payload.lon = val.geo.longitude;

                    tmpMsg.payload.icon = "globe";
                    tmpMsg.payload.iconColor = "green";
                    tmpMsg.payload.layer = "l" + msg.layer;
                    node.send(tmpMsg);
                }
            }

        });
    }
    RED.nodes.registerType("ParkingDataMapper", ParkingDataMapper);
};
