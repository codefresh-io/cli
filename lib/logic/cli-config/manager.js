const CFError = require('cf-errors'); // eslint-disable-line
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const {NoPropertyError, MultiplePropertiesError, NotFullPropertyError} = require('./errors');

const model = require('./model');

const {codefreshPath} = require('../../constants');

const dirPath = path.resolve(codefreshPath, 'cli-config');
const filePath = path.resolve(dirPath, 'config.yaml');

let FULL_CONFIG;

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
                default: model.default(),
            },
        };
        const file = fs.openSync(filePath, 'w');
        fs.writeSync(file, yaml.safeDump(fullConfig));
        fs.closeSync(file);
        return fullConfig;
    }
    return yaml.safeLoad(fs.readFileSync(filePath));
}
//
// function _loadConfig(profile) {
//
// }

class CliConfigManager {
    constructor(config) {
        this._config = config;
    }

    get(propertyName) {
        const properties = model.findProperties(propertyName);
        this.validate(properties, propertyName);
        return _.get(this._config, propertyName);
    }

    set(propertyName, value) {
        const properties = model.findProperties(propertyName);
        this.validate(properties, propertyName);
        _.set(this._config, propertyName, value);
    }

    update(config) {
        _.keys(config).forEach((key) => {
            this.set(key, _.get(config, key));
        });
    }

    validate(properties, propertyName) {
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

    config() {
        return _.cloneDeep(this._config);
    }

    profile() {
        return FULL_CONFIG.currentProfile;
    }

    availableProperties() {
        return model.properties();
    }

    /**
     * @return boolean: defines whether profile was created or not
     * */
    useProfile(name) {
        let created = false;
        if (name === FULL_CONFIG.currentProfile) {
            throw new CFError('Already using this profile');
        }
        let selectedConfig = FULL_CONFIG.profiles[name];
        if (!selectedConfig) {
            selectedConfig = {};
            FULL_CONFIG.profiles[name] = selectedConfig;
            created = true;
        }
        this._config = _.defaultsDeep(selectedConfig, model.default());
        FULL_CONFIG.currentProfile = name;
        return created;
    }

    persistConfig() {
        const file = fs.openSync(filePath, 'w');
        fs.writeSync(file, yaml.safeDump(FULL_CONFIG));
        fs.closeSync(file);
    }
}

FULL_CONFIG = _loadFullConfig();
const profile = FULL_CONFIG.currentProfile || 'default';

module.exports = new CliConfigManager(FULL_CONFIG.profiles[profile]);
