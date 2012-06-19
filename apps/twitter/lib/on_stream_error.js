module.exports = function(instance, user, client, connection) {

  return function(error) {
    console.log('============== error event ==============');
    console.log(error);
    console.log('============ end error event ============');
  };
};