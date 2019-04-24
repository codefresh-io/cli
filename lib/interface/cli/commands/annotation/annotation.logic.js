/* eslint-disable no-use-before-define,object-curly-newline,arrow-body-style */

const { sdk } = require('../../../../logic');

class AnnotationLogic {

    static async listAnnotations({ entityId, entityType, labels }) {
        let annotations = [];
        try {
            annotations = await sdk.annotations.list({ entityId, entityType });
        } catch (error) {
            if (error.statusCode === 404) {
                console.error('Annotations not found for specified entity');
            } else {
                console.error(error.message);
            }
            return null;
        }

        if (labels) {
            annotations = annotations.filter(annotation => labels.includes(annotation.key));
        }

        return annotations;
    }

    static createAnnotations({ entityId, entityType, labels }) {
        if (!labels || !labels.length) {
            console.error('labels are required for set command');
            return Promise.resolve();
        }

        const annotations = AnnotationLogic._parseAnnotations(labels);
        const requests = annotations.map(({ key, value }) => {
            return sdk.annotations.create({ entityId, entityType, key, value });
        });

        return Promise.all(requests);
    }

    static deleteAnnotations({ entityId, entityType, labels }) {
        if (labels) {
            const requests = labels.map((key) => {
                return sdk.annotations.delete({ entityId, entityType, key });
            });
            return Promise.all(requests);
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
