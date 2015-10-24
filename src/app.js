import remote from 'remote';
import React from 'react';
import ipc from 'ipc';
import webUtil from './utils/webUtil';
import util from './utils/util';
import path from 'path';
import Router from 'react-router';
import routes from './routes';
import routerContainer from './router';
import Settings from './utils/settingsUtil';
import HttpAPI from './utils/httpUtil'
import LogStore from './stores/logStore'
import yargs from 'yargs';



var app = remote.require('app');
var Menu = remote.require('menu');

process.env.APP_DATA_PATH = path.join(app.getPath('userData'));


// Init process
LogStore.initLogs();
util.createDir(path.join(process.env.APP_DATA_PATH, 'bin'));
webUtil.addLiveReload();
webUtil.disableGlobalBackspace();
HttpAPI.init();

var router = Router.create({
    routes: routes
});

router.run(Handler => React.render( < Handler / > , document.body));
routerContainer.set(router);

// Default Route
util.createDir(path.join(process.env.APP_DATA_PATH, 'bin')).then(function() {
    return new Promise((resolve) => {
        Settings.setInstalledAndRunning(path.join(process.env.APP_DATA_PATH, 'bin'))
            .then(function() {
                HttpAPI.toggle(Settings.get('HTTPAPIEnabled'), Settings.get('HTTPAPIPort'))
                    .then(resolve)
                    .catch(function(e) {
                        console.log(e);
                        Settings.save('HTTPAPIEnabled', false);
                        resolve();
                    });
            });
    });
}).then(function() {
    var args = yargs(process.argv.slice(1)).wrap(100).argv;
    if (!args.hide && !Settings.get('startMinimized')) {
        console.log(args.hide, Settings.get('startMinimized'))
        ipc.send('application:show');
    }
    router.transitionTo('dashboard');
});


// Event fires when the app receives a custom protocal url
ipc.on('application:open-url', opts => {
    console.log('open', opts);
});

module.exports = {
    router: router
};
