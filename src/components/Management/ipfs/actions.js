import _ from 'lodash';
import Promise from 'bluebird';
import async from 'async';
import path from 'path';
import {
    dialog
}
from 'remote';
import alt from '../../../alt'
import IPFSUtil from '../../../utils/daemon/ipfs';
import CommonUtil from '../../../utils/CommonUtil';


class Actions {
    constructor() {
        this.generateActions(
            'pined'
        );
    }
    pinHash() {

    }
    pinLocal() {
        dialog.showOpenDialog({
            title: 'Select file',
            properties: ['openFile', 'createDirectory', 'multiSelections'],
        }, filenames => {
            if (filenames) {
                let queue = async.queue((file, next) => {
                    Promise.all([IPFSUtil.addFile(file), CommonUtil.folderSize(file)])
                        .spread((hash, size) => {
                            IPFSUtil.pinHash(hash.Hash).then(res => {
                                _.defer(() => {
                                    this.actions.pined({
                                        name: path.basename(file),
                                        hash: res,
                                        size: CommonUtil.formatBytes(size.toFixed(3), 2)
                                    });
                                    process.nextTick(next);
                                });
                            })
                        })
                        .catch(err => {
                            console.error(err);
                            process.nextTick(next);
                        });
                }, 2);
                _.forEach(filenames, file => {
                    queue.push(file)
                });
            }
        });
    }
    pinURL() {

    }
}


export
default alt.createActions(Actions);