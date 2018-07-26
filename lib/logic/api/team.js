const _ = require('lodash');
const { sendHttpRequest } = require('./helper');
const Team = require('../entities/Team');


const _extractFieldsForTeamEntity = team => ({
    id: team._id,
    name: team.name,
    type: team.type,
    account: team.account,
    tags: team.tags,
    users: team.users.map(({ id, userName }) => ({ id, userName }))
});


const createTeam = async (data) => {
    const options = {
        url: '/api/team/',
        method: 'POST',
        body: data,
    };

    return sendHttpRequest(options);
};

const assignUserToTeam = async (userId, teamId) => {
    const options = {
        url: `/api/team/${teamId}/${userId}/assignUserToTeam`,
        method: 'PUT',
    };

    return sendHttpRequest(options);
};

const getTeams = async () => {
    const userOptions = {
        url: '/api/team/',
        method: 'GET',
    };

    const result = await sendHttpRequest(userOptions);
    const teams = [];
    let data = {};
    _.forEach(result, (team) => {
        data = _extractFieldsForTeamEntity(team);
        teams.push(new Team(data));
    });

    return teams;
};

const removeUserFromTeam = async (teamId, userId) => {
    const options = {
        url: `/api/team/${teamId}/${userId}/deleteUserFromTeam`,
        method: 'PUT',
    };

    return sendHttpRequest(options);
};


module.exports = {
    createTeam,
    assignUserToTeam,
    removeUserFromTeam,
    getTeams,
};
