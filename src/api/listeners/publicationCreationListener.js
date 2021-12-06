
//Route to get all publications
function listen(firebaseApp, database){
        const db =     database.getDatabase(firebaseApp);
        const recentPostsRef = database.query(database.ref(db, 'Publications/All'), database.orderByKey());
        const on = database.onValue;

        on(recentPostsRef, (snapshot) => {
            const data = snapshot.val();
            //console.log(data);
          })
}

module.exports = {listen};