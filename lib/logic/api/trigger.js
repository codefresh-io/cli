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

const _extractTriggerEventEntity = triggerEvent => ({
    uri: triggerEvent.uri,
    type: triggerEvent.type,
    kind: triggerEvent.kind,
    // [0]{12} - public account ID
    public: triggerEvent.account === '000000000000',
    secret: triggerEvent.secret,
    status: triggerEvent.status,
    endpoint: triggerEvent.endpoint,
    description: triggerEvent.description,
    help: triggerEvent.help,
});

const _extractTriggerEntity = trigger => ({
    event: trigger.event,
    pipeline: trigger.pipeline,
});

// TRIGGER TYPES

const getAllTypes = async () => {
    const RequestOptions = {
        url: '/api/hermes/types',
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
        url: `/api/hermes/types/${type}/${kind}`,
        method: 'GET',
    };

    const ttype = await sendHttpRequest(options);
    const data = _extractTriggerTypeEntity(ttype);
    return new TriggerType(data);
};

// TRIGGERS

const getTriggers = async () => {
    const options = {
        url: '/api/hermes/triggers/',
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

const getPipelineTriggers = async (pipeline) => {
    const options = {
        url: `/api/hermes/triggers/pipeline/${pipeline}`,
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

const getEventTriggers = async (event) => {
    const options = {
        url: `/api/hermes/triggers/event/${event.replace('/', '_slash_')}`,
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

const createTrigger = async (event, pipeline) => {
    const options = {
        url: `/api/hermes/triggers/${event.replace('/', '_slash_')}/${pipeline}`,
        method: 'POST',
    };

    return sendHttpRequest(options);
};

const deleteTrigger = async (event, pipeline) => {
    const options = {
        url: `api/hermes/triggers/${event.replace('/', '_slash_')}/${pipeline}`,
        method: 'DELETE',
    };

    return sendHttpRequest(options);
};

// TRIGGER EVENTS

const getEvent = async (event) => {
    const options = {
        url: `/api/hermes/events/${event.replace('/', '_slash_')}`,
        method: 'GET',
    };

    const triggerEvent = await sendHttpRequest(options);
    const data = _extractTriggerEventEntity(triggerEvent);
    return new TriggerEvent(data);
};

const getEvents = async (type, kind, filter, pub) => {
    const options = {
        url: `/api/hermes/events/?type=${type}&kind=${kind}&filter=${filter.replace('/', '_slash_')}&public=${pub}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(options);
    const triggerEvents = [];

    _.forEach(result, (triggerEvent) => {
        const data = _extractTriggerEventEntity(triggerEvent);
        triggerEvents.push(new TriggerEvent(data));
    });

    return triggerEvents;
};

const createEvent = async (type, kind, secret, values, context, pub) => {
    const options = {
        url: `/api/hermes/events/?public=${pub}`,
        method: 'POST',
        body: {
            type, kind, secret, values, context,
        },
        json: true,
    };

    return sendHttpRequest(options);
};

const deleteEvent = async (event, context) => {
    const options = {
        url: `/api/hermes/events/${event.replace('/', '_slash_')}/${context}`,
        method: 'DELETE',
    };

    return sendHttpRequest(options);
};

module.exports = {
    // trigger type methods
    getType,
    getAllTypes,
    // trigger methods
    getTriggers,
    getPipelineTriggers,
    getEventTriggers,
    createTrigger,
    deleteTrigger,
    // trigger event methods
    getEvent,
    getEvents,
    createEvent,
    deleteEvent,
};
