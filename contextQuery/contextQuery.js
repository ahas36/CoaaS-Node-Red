/**
 * Created by ali on 4/03/2017.
 */
module.exports = function(RED) {
    function contextQueryNode(config) {
        RED.nodes.createNode(this,config);
        this.query=config.query;
        var node = this;
        this.on('input', function(msg) {
            var msg = { payload:this.query,topic:"query" };
            node.send(msg);
        });


    }
    RED.nodes.registerType("contextQuery",contextQueryNode);
}