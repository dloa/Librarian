import path from 'path';
import _ from 'lodash';
import alt from '../alt';
import DaemonUtil from '../utils/daemonEngineUtil';
import IPFSUtil from '../utils/daemon/ipfs';


/*

installing codes:

0 = disabled	- disabled
1 = checking    - exsistance
2 = installing  - to bin
3 = installed   - <.<
4 = enabling    - >.>                           
5 = updating    - can be daemon or bootstrap    w/ info key
6 = syncing     - block chain                  
7 = done        - if you dont know what this means close the tab.   
8 = error       - w/ error: key for.. info.

*/


class daemonEngineActions {

    constructor() {
        this.generateActions(
            'update',

            'enabled',
            'disabled',

            'enabling'
        );
    }

    ipfs(action, params) {
        this.dispatch();
        switch (action) {
            case 'enable':
                DaemonUtil.checkInstalled('ipfs')
                    .then(installed => {
                        if (installed)
                            DaemonUtil.enable({
                                id: 'ipfs',
                                args: ['daemon']
                            });
                        else
                            this.actions.ipfs('install');
                    });
                break;
            case 'disable':
                DaemonUtil.disable('ipfs');
                break;
            case 'pinned-total':
                IPFSUtil.refreshStats(true)
                    .then(this.actions.update);
                break;
            case 'refresh-stats':
                IPFSUtil.refreshStats()
                    .then(this.actions.update)
                    .catch(err => {
                        if (err)
                            console.error(err)
                    });
                break;
            case 'install':
                DaemonUtil.install({
                    id: 'ipfs',
                    args: ['init']
                }).then(this.actions.ipfs.bind(this, 'enable')).catch(err => {
                    if (err)
                        console.error(err)
                });
                break;
        }
    }

    florincoind(action, params) {
        this.dispatch();
        switch (action) {
            case 'enable':
                DaemonUtil.checkInstalled('florincoind')
                    .then(installed => {
                        if (installed)
                            DaemonUtil.enable({
                                id: 'florincoind',
                                args: ['-printtoconsole']
                            });
                        else
                            this.actions.florincoind('install');
                    });
                break;
            case 'disable':
                DaemonUtil.disable('florincoind');
                break;
            case 'install':
                DaemonUtil.install({
                    id: 'florincoind',
                    args: []
                }, ((process.platform === 'darwin') ? true : false))
                    .then(this.actions.libraryd.bind(this, 'enable'))
                    .catch(console.error);
                break;
        }
    }

    libraryd(action, params) {
        this.dispatch();
        switch (action) {
            case 'enable':
                DaemonUtil.checkInstalled('libraryd')
                    .then(installed => {
                        if (installed)
                            DaemonUtil.enable({
                                id: 'libraryd',
                                args: []
                            });
                        else
                            this.actions.libraryd('install');
                    });
                break;
            case 'disable':
                DaemonUtil.disable('libraryd');
                break;
            case 'install':
                DaemonUtil.install({
                    id: 'libraryd',
                    args: []
                }, ((process.platform === 'darwin') ? true : false))
                    .then(this.actions.libraryd.bind(this, 'enable'))
                    .catch(console.error);
                break;
        }
    }


}

export
default alt.createActions(daemonEngineActions);