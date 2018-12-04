const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { NoPropertyError, MultiplePropertiesError, NotFullPropertyError } = require('./errors');

const Model = require('./model');

const { codefreshPath } = require('../../constants');

const dirPath = path.resolve(codefreshPath, 'cli-config');
const filePath = path.resolve(dirPath, 'config.yaml');

let FULL_CONFIG;
let CURRENT_CONFIG;

/**
 * Remove properties that not exist at schema and add default values
 * */
function _extractConfig(config = {}) {
    const newConfig = {};
    Model.properties().forEach((key) => {
        _.set(newConfig, key, _.get(config, key));
    });
    return _.defaultsDeep(newConfig, Model.default());
}

function _loadFullConfig() {
    if (!fs.existsSync(codefreshPath)) {
        fs.mkdirSync(codefreshPath);
    }
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    if (!fs.existsSync(filePath)) {
        const fullConfig = {
            currentProfile: 'default',
            profiles: {
                default: Model.default(),
            },
        };
        const file = fs.openSync(filePath, 'w');
        fs.writeSync(file, yaml.safeDump(fullConfig));
        fs.closeSync(file);
        return fullConfig;
    }
    return yaml.safeLoad(fs.readFileSync(filePath));
}

function _validate(properties, propertyName) {
    if (!properties.length) {
        throw new NoPropertyError(propertyName);
    }
    if (properties.length > 1) {
        throw new MultiplePropertiesError(properties);
    }
    if (properties[0] !== propertyName) {
        throw new NotFullPropertyError(properties[0]);
    }
}

class CliConfigManager {
    /**
     * Get all available properties containing "propertyName"
     * */
    static get(propertyName) {
        const properties = Model.findProperties(propertyName);
        if (!properties.length) {
            throw new NoPropertyError(propertyName);
        }
        return properties.reduce((obj, key) => {
            _.set(obj, key, _.get(CURRENT_CONFIG, key));
            return obj;
        }, {});
    }


    static set(propertyName, value) {
        const properties = Model.findProperties(propertyName);
        _validate(properties, propertyName);
        _.set(CURRENT_CONFIG, propertyName, value);
        Model.validate(CURRENT_CONFIG);
    }

    static config() {
        return _.cloneDeep(CURRENT_CONFIG);
    }

    static currentProfile() {
        return FULL_CONFIG.currentProfile;
    }

    static profiles() {
        return _.keys(FULL_CONFIG.profiles);
    }

    static availableProperties() {
        return Model.properties();
    }

    /**
     * Use or create a profile.
     *
     * @return boolean: defines whether profile was created or not
     * */
    static useProfile(profile) {
        const selectedConfig = FULL_CONFIG.profiles[profile];
        const created = !selectedConfig;
        CURRENT_CONFIG = _extractConfig(selectedConfig);
        FULL_CONFIG.profiles[profile] = CURRENT_CONFIG;
        FULL_CONFIG.currentProfile = profile;
        return created;
    }

    static persistConfig() {
        const file = fs.openSync(filePath, 'w');
        fs.writeSync(file, yaml.safeDump(FULL_CONFIG));
        fs.closeSync(file);
    }
}

FULL_CONFIG = _loadFullConfig();
CliConfigManager.useProfile(FULL_CONFIG.currentProfile || 'default');

module.exports = CliConfigManager;
