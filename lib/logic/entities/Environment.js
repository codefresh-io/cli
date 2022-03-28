const Entity = require('./Entity');

const _getServiceInfo = (environment) => {
    const services = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < environment.instances.length; i++) {
        const service = environment.instances[i];
        services.push({
            serviceName: service.serviceName,
            image: service.image,
            sha: service.sha,
            branch: service.branch,
            repoName: service.repoName,
            serviceURL: service.urls,
        });
    }
    return services;
};

class Environment extends Entity {
    constructor(data) {
        super();
        this.entityType = 'environment';
        this.info = data;
        this.defaultColumns = ['id', 'name'];
        this.wideColumns = ['id', 'name', 'status'];
    }

    static fromResponse(response) {
        return new Environment({
            id: response._id,
            status: response.creationStatus,
            name: response.name,
            servicesInfo: _getServiceInfo(response),
        });
    }
}

module.exports = Environment;
