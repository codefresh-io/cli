/* eslint-disable no-use-before-define,object-curly-newline,arrow-body-style */

const _ = require('lodash');
const CFError = require('cf-errors');
const Promise = require('bluebird');
const { sdk } = require('../../../../logic');

class AnnotationLogic {
    static async listAnnotations({ entityId, entityType, labels }) {
        let annotations = [];
        try {
            annotations = await sdk.annotations.list({ entityId, entityType });
        } catch (error) {
            if (error.statusCode === 404) {
                throw new CFError({
                    message: `Annotations not found for specified entity: type = ${entityType}; id = ${entityId}`,
                    cause: error,
                });
            } else {
                throw error;
            }
        }

        if (_.isArray(labels) && !_.isEmpty(labels)) {
            annotations = _.filter(annotations, (annotation) => labels.includes(annotation.key));
        }

        return annotations;
    }

    static createAnnotations({ entityId, entityType, labels, display }) {
        if (!_.isArray(labels)) {
            throw new Error('Labels should be an array');
        }
        if (_.isEmpty(labels)) {
            throw new Error('Labels are required for set command');
        }
        if (display && entityType !== 'workflow') {
            throw new Error('display option is supporeted only for workflow annotation');
        }

        const annotations = AnnotationLogic._parseAnnotations(labels);
        return Promise.map(
            annotations,
            ({ key, value }) => sdk.annotations.create({
                entityId,
                entityType,
                key,
                value,
                display,
            }),
            { concurrency: 1 },
        );
    }

    static deleteAnnotations({ entityId, entityType, labels }) {
        if (!_.isEmpty(labels)) {
            return Promise.map(labels, (key) => sdk.annotations.delete({ entityId, entityType, key }), { concurrency: 1 });
        }
        return sdk.annotations.delete({ entityId, entityType });
    }

    static _parseAnnotations(labels) {
        return _.map(labels, (label) => {
            const [key, value] = label.split('=');
            return { key, value };
        });
    }
}

module.exports = AnnotationLogic;
