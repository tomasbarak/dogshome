const axios = require('axios');
const config = require('./config.json');
const ids = require(config.ids_file_path);
const fs = require('fs');

//Function that returns the info of a relation synchronously
async function getRelationInfo(id) {
    const url = `https://www.openstreetmap.org/api/0.6/relation/${id}.json`;
    const response = await axios.get(url);
    const data = response.data;
    return {
        id: data.elements[0].id,
        name: data.elements[0].tags.name,
    };
}

//Await for all the relations to be fetched
async function getRelations() {
    const relations = await Promise.all(ids.map(getRelationInfo));
    return relations;
}

const saveAllRelationsInfo = () => {
    return new Promise((resolve, reject) => {
        getRelations().then((relations) => {
            fs.writeFile('relations.json', JSON.stringify(relations, null, 4), (err) => {
                if (err) reject(err);
                resolve();
            });
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports = {
    getRelationInfo,
    getRelations,
    saveAllRelationsInfo,
}