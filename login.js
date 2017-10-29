function login(email, password, callback) {
  mongo('mongodb://user:pass@mymongoserver.com/my-db', function (db) {
    var users = db.collection('users');
    users.findOne({ email: email }, function (err, user) {

      if (err) return callback(err);

      if (!user) return callback(new WrongUsernameOrPasswordError(email));

      bcrypt.compare(password, user.password, function (err, isValid) {
        if (err) {
          callback(err);
        } else if (!isValid) {
          callback(new WrongUsernameOrPasswordError(email));
        } else {
          callback(null, {
            user_id: user._id.toString(),
            nickname: user.nickname,
            email: user.email
          });
        }
      });
    });
  });
}
