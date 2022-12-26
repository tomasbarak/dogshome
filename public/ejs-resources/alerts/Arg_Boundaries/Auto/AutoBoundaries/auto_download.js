const axios = require('axios');
const config = require('./config.json');
const fs = require('fs');
const stream = require('stream');
const { promisify } = require('util');

const ids = require("./departments.json");

const finished = promisify(stream.finished);

const downloadDepartment = async (fileUrl, outputLocationPath) => {
  const writer = fs.createWriteStream(outputLocationPath);
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  }).catch(err => {
    console.log(err);
  });
}

const downloadAllDepartments = () => {
  return new Promise((resolve, reject) => {
    let i = 0;
    function nextFile() {
        if(i < ids.length - 1) {
            downloadDepartment(`https://osm-boundaries.com/Download/Submit?apiKey=43ff619d7ddf4809b2792782238f131d&db=osm20221107&osmIds=-${ids[i].id}&format=GeoJSON&srid=4326&landOnly`, `${config.download_path}/${ids[i].nombre}.geojson.gz`).then((d) => {
                console.log("downloaded", ids[i].nombre, i);
            }).catch((err) => {
              reject(err);
            });

            i++;
            setTimeout(nextFile, 3000);
        } else {
          resolve();
        }
    }
    // Start the loop
    setTimeout(nextFile, 0);
  });
}

module.exports = {
  downloadDepartment,
  downloadAllDepartments,
};