function init(firebaseAdmin){
    const listAllUsers = (nextPageToken) => {
        // List batch of users, 1000 at a time.
        firebaseAdmin.auth()
          .listUsers(1000, nextPageToken)
          .then((listUsersResult) => {
            listUsersResult.users.forEach((userRecord) => {
              console.log('user', userRecord.toJSON().uid);
            });
            if (listUsersResult.pageToken) {
              // List next batch of users.
              listAllUsers(listUsersResult.pageToken);
            }
          })
          .catch((error) => {
            console.log('Error listing users:', error);
          });
      };
      // Start listing users from the beginning, 1000 at a time.
      listAllUsers();
      
}

module.exports = {init}