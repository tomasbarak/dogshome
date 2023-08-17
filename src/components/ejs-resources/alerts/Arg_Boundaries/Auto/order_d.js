const depts_old = require('./buenos_aires.json');
const depts_new = require('./relations.json');

const fs = require('fs');

console.log(depts_old);
console.log(depts_new);

const departments = [];

depts_old.departamentos.forEach((dept_old) => {
    depts_new.forEach((dept_new) => {
        if (dept_old.nombre === dept_new.name) {
            departments.push({
                nombre: dept_old.nombre,
                id: dept_new.id,
            });
        }
    });
});

//Save pretty JSON
fs.writeFile('departments.json', JSON.stringify(departments, null, 4), (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
});


// Find departments that are not in the departments list
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

console.log("not found", departments_not_found);