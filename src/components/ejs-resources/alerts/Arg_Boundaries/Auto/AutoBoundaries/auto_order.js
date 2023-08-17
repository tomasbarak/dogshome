const fs = require('fs');
const config = require('./config.json');

const depts_old = require(config.departments_file_path);
const depts_new = require('./relations.json');


const formatDepartmentsName = () => {
    const departments = [];
    depts_old.departamentos.forEach((dept_old) => {
        depts_new.forEach((dept_new) => {
            console.log(dept_old.nombre, dept_new.name);
            if (dept_old.nombre === dept_new.name.replace(/Partido de /g, '').replace(/Partido del /g, '')) {
                departments.push({
                    nombre: dept_old.nombre,
                    id: dept_new.id,
                });
            }
        });
    });

    return departments;
}

const saveModifiedDepartments = (departments) => {
    return new Promise((resolve, reject) => {
        fs.writeFile('departments.json', JSON.stringify(departments, null, 4), (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}


const findDepartmentsNotFound = (departments) => {
    const departments_not_found = [];

    depts_old.departamentos.forEach((dept_old) => {
        let found = false;
        departments.forEach((dept) => {
            if (dept_old.nombre === dept.nombre) {
                found = true;
            }
        });
        if (!found) {
            departments_not_found.push(dept_old.nombre);
        }
    });

    return departments_not_found;
}


module.exports = {
    formatDepartmentsName,
    saveModifiedDepartments,
    findDepartmentsNotFound,
}