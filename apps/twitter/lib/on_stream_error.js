module.exports = function(instance, user, remote) {

  return function(error) {
    console.log('============== error event ==============');
    console.log(error);
    console.log('============ end error event ============');
  };
};