import async from 'async';
import Promise from 'bluebird';
import {
    v1 as uuid
}
from 'node-uuid';
import moment from 'moment';
import _ from 'lodash';
import alt from '../../alt'

import fileUtil from './utils/evalFile'
import CommonUtil from '../../utils/CommonUtil';

class publishingActions {

    constructor() {
        this.generateActions(
            'setMeta',
            'addedFiles',
            'youtubeAuthorized',
            'youtubeContent'
        );
    }

    processFiles(type, files) {
        this.dispatch();
        let queue = async.queue((file, next) => {
            Promise.all([fileUtil.mediaInfo(file.path), fileUtil.audioTag(file.path), CommonUtil.folderSize(file.path)])
                .spread((mediaInfo, tags = {}, size) => {
                    tags.duration = moment.duration(parseInt(mediaInfo[0]), 'ms').asMinutes().toFixed(2);
                    tags._id = uuid();
                    this.actions.addedFiles(tags);
                    process.nextTick(next);
                })
                .catch(err => {
                    console.error(err);
                    process.nextTick(next);
                });
        });

        _.forEach(files, file => {
            queue.push(file)
        });
    }

    authorize(service) {
        this.dispatch();

        switch (service) {
            case 'youtube':
                require('./utils/youtubeUtil').getAuthorization()
                    .then(() => {
                        this.actions.getContent('youtube');
                    });
                break;
        }
    }

    getContent(service) {
        this.dispatch();

        switch (service) {
            case 'youtube':
                require('./utils/youtubeUtil').getContent();
                break;
        }
    }

}


export
default alt.createActions(publishingActions);