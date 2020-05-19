const _ = require('lodash');

function prettyError(error) {
    try {
        const errMsg = _.get(error, 'message', error);
        let errObj = JSON.parse(errMsg);
        if (typeof errObj === 'string') {
            errObj = JSON.parse(errObj);
        }

        if (!errObj.message) {
            return error;
        }

        return errObj.code ? `${errObj.message} [code: ${errObj.code}]` : errObj.message;
    } catch (e) {
        return _.get(error, 'message', JSON.stringify(error));
    }
}

module.exports = {
    prettyError,
};
