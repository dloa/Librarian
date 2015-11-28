import {
    EventEmitter
}
from 'events';
import assign from 'object-assign';
import _ from 'lodash';
import os from 'os';
import {
    getVersion as AppName
}
from '../utils/aboutUtil';
var _logs = [];

module.exports = assign(Object.create(EventEmitter.prototype), {
    SERVER_LOGS_EVENT: 'server_logs_event',

    error: function(line, obj) {
        var d = new Date();
        this.push('[ERROR] ' + d.toLocaleString() + ' ' + line, obj);
    },

    info: function(line, obj) {
        var d = new Date();
        this.push('[INFO] ' + d.toLocaleString() + ' ' + line, obj);
    },

    warn: function(line, obj) {
        var d = new Date();
        this.push('[WARNING] ' + d.toLocaleString() + ' ' + line, obj);
    },

    debug: function(line, obj) {
        var d = new Date();
        this.push('[DEBUG] ' + d.toLocaleString() + ' ' + line, obj);
    },

    push: function(line, obj) {
        var log = false;
        if (obj) {
            log = "\n" + line.toString();
            _.each(obj, function(elem, key) {
                if (typeof elem === 'object') {
                    log += "\n\t" + key.toString();
                    _.each(elem, function(subElem, subKey) {
                        if (typeof subElem === 'object') {
                            _.each(subElem, function(subSubElem, subSubKey) {
                                log += "\n\t\t" + subSubKey.toString() + ": " + subSubElem;
                            });
                        } else {
                            if (typeof subKey === 'string') {
                                log += "\n\t\t" + subKey.toString() + ": " + subElem;
                            } else {
                                log += "\n\t\t" + subElem;
                            }

                        }
                    });
                } else {
                    log += "\n\t" + key.toString() + ": " + elem;
                }
            });
        } else {
            log = line.toString();
        }

        _logs.push(log);
        this.emit(this.SERVER_LOGS_EVENT);
    },

    logs: function() {
        return _logs || [];
    },

    empty: function() {
        _logs = [];
    },

    initLogs: function(appVersion) {
        var ifaces = os.networkInterfaces();
        var memories = os.totalmem() / 1024 / 1024 / 1024;
        var freeMemories = os.freemem() / 1024 / 1024 / 1024;
        this.info("Launching Application: " + AppName());
        this.info("Network Interfaces", ifaces);
        this.info("Operating System", {
            'Release': os.release(),
            'Type': os.type(),
            'Arch': os.arch(),
            'LoadAvg': os.loadavg(),
            'Total Memory': memories + 'GB',
            'Free Memory': freeMemories + 'GB',
            'CPUs': os.cpus().length
        });
    }
});