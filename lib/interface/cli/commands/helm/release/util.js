const { sdk } = require('../../../../../logic');

class HelmUtil {
    // eslint-disable-next-line class-methods-use-this
    async isHelm3(cluster) {
        try {
            const config = await sdk.helm['cluster-config'].get({
                selector: cluster,
            });
            return config.helmVersion === 'helm3';
        } catch (e) {
            return false;
        }
    }
}
module.exports = new HelmUtil();
