const auto = {
    "download": require('./auto_download'),
    "info": require('./auto_info'),
    "order": require('./auto_order')
}

auto.info.getRelations().then((relations) => {
    auto.info.saveAllRelationsInfo().then(() => {
        console.log("Saved relations info");

        const departments = auto.order.formatDepartmentsName();
        const departments_not_found = auto.order.findDepartmentsNotFound(departments)

        console.log(departments);
        console.log("not found", departments_not_found);

        auto.order.saveModifiedDepartments(departments).then(() => {
            console.log("Saved modified departments");
            auto.download.downloadAllDepartments().then(() => {
                console.log("Downloaded all relations");
            });
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });
}).catch((err) => {
    console.log(err);
});