import util from './util';


var defaultSettings = {
    /* Startup */
    launchStartup: false,
    startMinimized: false,

    saveCredentials: false,

    /* HTTP API */
    HTTPAPIPort: 8079,
    HTTPAPIEnabled: true
};

module.exports = {
   
    get: function(item) {
        var haveDefault = null,
            value = localStorage.getItem('settings.' + item);

        // hack to parse the local storage type and fully
        // backward compatible
        try {
            value = JSON.parse(value);
        } catch (e) {
            if (value === 'true' || 'false') {
                value = (value === 'true') ? true : false;
            }
        }

        if (defaultSettings[item] && value === null) {
            value = defaultSettings[item];
        }

        return value;
    },
    save: function(key, value) {
        console.info('Preferences | ' + key + ' = ' + value);
        return new Promise((resolve) => {
            localStorage.setItem('settings.' + key, JSON.stringify(value));
            resolve();
        });
    },
    reset: function() {
        return new Promise((resolve) => {
            localStorage.clear();
            resolve();
        });
    }
}
