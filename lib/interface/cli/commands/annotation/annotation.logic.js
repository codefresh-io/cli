/* eslint-disable no-use-before-define,object-curly-newline,arrow-body-style */

const Promise = require('bluebird');
const { sdk } = require('../../../../logic');

class AnnotationLogic {

    static async listAnnotations({ entityId, entityType, labels }) {
        let annotations = [];
        try {
            annotations = await sdk.annotations.list({ entityId, entityType });
        } catch (error) {
            if (error.statusCode === 404) {
                throw new Error('Annotations not found for specified entity');
            } else {
                throw error;
            }
        }

        if (labels && labels.length) {
            annotations = annotations.filter(annotation => labels.includes(annotation.key));
        }

        return annotations;
    }

    static createAnnotations({ entityId, entityType, labels }) {
        if (!labels || !labels.length) {
            throw new Error('Labels are required for set command');
        }

        const annotations = AnnotationLogic._parseAnnotations(labels);
        return Promise.map(annotations, ({ key, value }) => sdk.annotations.create({ entityId, entityType, key, value }));
    }

    static deleteAnnotations({ entityId, entityType, labels }) {
        if (labels && labels.length) {
            return Promise.map(labels, key => sdk.annotations.delete({ entityId, entityType, key }));
        }

        return sdk.annotations.delete({ entityId, entityType });
    }

    static _parseAnnotations(labels) {
        return labels.map((label) => {
            const [key, value] = label.split('=');
            return { key, value };
        });
    }
}

module.exports = AnnotationLogic;
