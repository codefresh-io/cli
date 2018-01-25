const _ = require('lodash');
const { sendHttpRequest } = require('./helper');
const TriggerType = require('../entities/TriggerType');
const TriggerEvent = require('../entities/TriggerEvent');
const Trigger = require('../entities/Trigger');


const _extractTriggerTypeEntity = triggerType => ({
    type: triggerType.type,
    kind: triggerType.kind,
    'uri-template': triggerType['uri-template'],
    'uri-regex': triggerType['uri-regex'],
});

const _extractTriggerEventEntity = (triggerEvent, eventURI) => ({
    uri: eventURI,
    status: triggerEvent.status,
    endpoint: triggerEvent.endpoint,
    description: triggerEvent.description,
    help: triggerEvent.help,
});

const _extractTriggerEntity = trigger => ({
    uri: trigger.event,
    secret: trigger.secret,
    count: trigger.pipelines.length,
    pipelines: trigger.pipelines,
});

const getAllTypes = async () => {
    const RequestOptions = {
        url: '/api/hermes/events/types',
        qs: {},
        method: 'GET',
    };

    const result = await sendHttpRequest(RequestOptions);
    const types = [];

    _.forEach(result, (type) => {
        const data = _extractTriggerTypeEntity(type);
        types.push(new TriggerType(data));
    });

    return types;
};


const getType = async (type, kind) => {
    const options = {
        url: `/api/hermes/events/types/${type}/${kind}`,
        method: 'GET',
    };

    const ttype = await sendHttpRequest(options);
    const data = _extractTriggerTypeEntity(ttype);
    return new TriggerType(data);
};

const getEventInfo = async (uri) => {
    const options = {
        url: `/api/hermes/events/info/${uri}`,
        method: 'GET',
    };

    const eventInfo = await sendHttpRequest(options);
    const data = _extractTriggerEventEntity(eventInfo, uri);
    return new TriggerEvent(data);
};

const getPipelineTriggers = async (pipeline) => {
    const options = {
        url: `/api/hermes/triggers/${pipeline}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(options);
    const triggers = [];

    _.forEach(result, (trigger) => {
        const data = _extractTriggerEntity(trigger);
        triggers.push(new Trigger(data));
    });

    return triggers;
};

const addPipelineTrigger = async (eventURI, pipelines) => {
    const options = {
        url: `/api/hermes/triggers/${eventURI}/pipelines`,
        method: 'POST',
        body: pipelines,
        json: true,
    };

    return sendHttpRequest(options);
};

const deletePipelineTrigger = async (eventURI, pipeline) => {
    const options = {
        url: `api/hermes/triggers/${eventURI}/pipelines/${pipeline}`,
        method: 'DELETE',
    };

    return sendHttpRequest(options);
};

module.exports = {
    getType,
    getAllTypes,
    getEventInfo,
    getPipelineTriggers,
    addPipelineTrigger,
    deletePipelineTrigger,
};
