const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { NoPropertyError, MultiplePropertiesError, NotFullPropertyError } = require('./errors');

const Model = require('./Model');
const { propertyComparator } = require('../../interface/cli/helpers/cli-config');

const { CODEFRESH_PATH } = require('../../interface/cli/defaults');

const dirPath = path.resolve(CODEFRESH_PATH, 'cli-config');
const filePath = path.resolve(dirPath, 'config.yaml');

let FULL_CONFIG;
let CURRENT_CONFIG = {};

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
    if (!fs.existsSync(CODEFRESH_PATH)) {
        fs.mkdirSync(CODEFRESH_PATH);
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
        this._preloadConfig();
        return properties.reduce((obj, key) => {
            _.set(obj, key, _.get(CURRENT_CONFIG, key));
            return obj;
        }, {});
    }


    static set(propertyName, value) {
        const properties = Model.findProperties(propertyName);
        _validate(properties, propertyName);
        this._preloadConfig();
        _.set(CURRENT_CONFIG, propertyName, value);
        Model.validate(CURRENT_CONFIG);
    }

    static config() {
        this._preloadConfig();
        return _.cloneDeep(CURRENT_CONFIG);
    }

    static currentProfile() {
        this._preloadConfig();
        return FULL_CONFIG.currentProfile;
    }

    static profiles() {
        this._preloadConfig();
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
        this._preloadConfig();
        const selectedConfig = FULL_CONFIG.profiles[profile];
        const created = !selectedConfig;
        CURRENT_CONFIG = _extractConfig(selectedConfig);
        FULL_CONFIG.profiles[profile] = CURRENT_CONFIG;
        FULL_CONFIG.currentProfile = profile;
        return created;
    }

    static persistConfig() {
        this._preloadConfig();
        const file = fs.openSync(filePath, 'w');
        fs.writeSync(file, yaml.safeDump(FULL_CONFIG));
        fs.closeSync(file);
    }

    static meta(propertyName) {
        const meta = Model.meta();
        return _.keys(meta)
            .filter(key => !propertyName || !propertyName.length || key.includes(propertyName))
            .sort(propertyComparator)
            .map(key => Object.assign({ key }, _.get(meta, key)));
    }

    static _preloadConfig() {
        if (!FULL_CONFIG) {
            this.loadConfig();
        }
    }

    static loadConfig() {
        FULL_CONFIG = _loadFullConfig();
        this.useProfile(FULL_CONFIG.currentProfile || 'default');
        this._validateConfig();
    }

    /**
     * Replaces "broken" properties with defaults and writes to config
     * */
    static _validateConfig() {
        try {
            Model.validate(CURRENT_CONFIG);
        } catch (e) {
            const errorPaths = e.errors.map(er => er.dataPath.replace('.', ''));

            console.warn('---------------');
            console.warn('!!! Some properties are invalid -- replacing with defaults:');

            errorPaths.forEach(ep => {
                console.warn(ep);
                _.set(CURRENT_CONFIG, ep, undefined);
            });
            console.warn('---------------\n');
            CURRENT_CONFIG = _.defaultsDeep(CURRENT_CONFIG, Model.default());
            CliConfigManager.persistConfig();
        }
    }
}

module.exports = CliConfigManager;
