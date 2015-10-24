import _ from 'lodash';
import path from 'path';
import Promise from 'bluebird';
import request from 'request';
import fs from 'fs';
import remote from 'remote';
import nodeUtil from 'util';
import {
    EventEmitter
}
from 'events';

import util from '../util';
import Settings from '../settingsUtil';



var AppData = process.env.APP_DATA_PATH;
var os = util.getOS();
var asarBIN = path.normalize(path.join(__dirname, '../../../', 'bin'));
var pinEmmiter = new EventEmitter();

module.exports = {
    download: function() {
        // To be done later.
    },
    cli: function(command) {
        return new Promise((resolve, reject) => {
            console.log([path.join(AppData, 'bin', (os === 'win') ? 'ipfs.exe' : 'ipfs')].concat(command))
            util.exec([path.join(AppData, 'bin', (os === 'win') ? 'ipfs.exe' : 'ipfs')].concat(command))
                .then(resolve)
                .catch(reject);
        });
    },
    getPinned: function() {
        return new Promise((resolve) => {
            this.cli(['pin', 'ls'])
                .then(function(res) {
                    var allres = [];
                    res.split('\n').forEach(function(subres) {
                        allres.push(subres.split(' ')[0]);
                    })

                    allres = allres.filter(Boolean);
                    var returnObject = [];
                    allres.forEach(function(subres) {
                        returnObject.push({
                            hash: subres.split(' ')[0]
                        })
                    })
                    resolve(returnObject);
                });
        });
    },
    pinlocalfiles: function() {
        var dialog = remote.require('dialog');
        let pinEmmiter = new EventEmitter();
        dialog.showOpenDialog({
            title: 'Select file',
            properties: ['openFile', 'createDirectory', 'multiSelections'],
        }, function(filenames) {
            filenames.forEach(function(filepath) {
                module.exports.addFile(filepath)
                    .then(module.exports.pinFile)
                    .then(function(pinRes) {
                        pinEmmiter.emit('pinned', {
                            hash: pinRes,
                            name: path.normalize(filepath),
                            message: pinRes
                        });
                    });
            });
        });
        return pinEmmiter;
    },
    pinFile: function(hash) {
        return new Promise((resolve, reject) => {
            this.cli(['pin', 'add', hash, '-r'])
                .then(resolve)
                .catch(reject)
        });
    },
    addFile: function(filepath) {
        return new Promise((resolve, reject) => {
            this.cli(['add', path.normalize(filepath)])
                .then(function(addedResponce) {
                    addedResponce = addedResponce.split(' ');
                    resolve(addedResponce[1]);
                });
        });
    },
    removePin: function(hash) {

    },
    install: function(tmppath) {
        return new Promise((resolve, reject) => {
            util.copyfile(path.join(asarBIN, os, (os === 'win') ? 'ipfs.exe' : 'ipfs'), path.join(AppData, 'bin', (os === 'win') ? 'ipfs.exe' : 'ipfs'))
                .then(function() {
                    return util.chmod(path.join(AppData, 'bin', (os === 'win') ? 'ipfs.exe' : 'ipfs'), '0777');
                })
                .then(function() {
                    return util.exec([path.join(AppData, 'bin', (os === 'win') ? 'ipfs.exe' : 'ipfs'), 'init']).catch(resolve);
                })
                .then(resolve)
                .catch(reject);
        });
    },
    enable: function() {
        this.daemon = util.child(path.join(AppData, 'bin', (util.getOS() === 'win') ? 'ipfs.exe' : 'ipfs'), ['daemon']);
        return new Promise((resolve, reject) => {
            try {
                this.daemon.start(function(pid) {
                    resolve(pid);
                });
            } catch (e) {
                reject(e);
            }
        });
    },
    disable: function() {
        return new Promise((resolve, reject) => {
            if (this.daemon) {
                try {
                    this.daemon.stop(function(code) {
                        resolve(code);
                    });
                } catch (e) {
                    module.exports.forceKill().then(resolve).catch(reject);
                }
            } else {
                module.exports.forceKill();
            }
        });
    },
    forceKill: function() {
        var ipfsname = (os === 'win') ? 'ipfs.exe' : 'ipfs';
        return util.killtask(ipfsname);
    }
};