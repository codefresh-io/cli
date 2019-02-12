const { Formatter } = require('../Formatter');

const EMPTY_FORMATTER = new Formatter();

// can`t do it explicitly, pkg dont allow dynamic require

/* eslint-disable */
const formatters = {
    Workflow: require('./Workflow.formatter'),
    Image: require('./Image.formatter'),
    Section: require('./Section.formatter'),
    Board: require('./Board.formatter'),
    Team: require('./Team.formatter'),
    HelmRepo: require('./HelmRepo.formatter'),
    TriggerType: require('./TriggerType.formatter'),
    TriggerEvent: require('./TriggerEvent.formatter'),
    Composition: require('./Composition.formatter'),
    Environment: require('./Environment.formatter'),
    GitRepo: require('./GitRepo.formatter'),
    CodefreshRepo: require('./CodefreshRepo.formatter'),
    Token: require('./Token.formatter'),
    Pipeline: require('./Pipeline.formatter'),
    Registry: require('./Registry.formatter'),
};
/* eslint-enable */

class FormatterRegistry {
    static get(formatterName) {
        return formatters[formatterName] || EMPTY_FORMATTER;
    }
}

module.exports = {
    FormatterRegistry,
};
