import ipc from 'ipc';
import alt from '../alt';


class updateActions {

    constructor() {
        this.generateActions(
            'mainUpdateFound',
            'daemonUpdatesFound'
        );
    }


    download(hash, type) {
        var UpdaterUtil = require('../utils/updaterUtil');
        this.dispatch();

        switch(type) {
          case 'app':
            // Download app update
            break;
          case 'ipfs':
            // Download ipfs update
            break;
          case 'libraryd':
            // Download libraryd update
            break;
        }

    }

    install(update, type) {
        var UpdaterUtil = require('../utils/updaterUtil');
        this.dispatch();


    }

}


export
default alt.createActions(updateActions);