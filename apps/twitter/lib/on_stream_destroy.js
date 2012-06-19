module.exports = function(instance, user, client, connection) {

  return function(destroy) {
    console.log('============== destroy event ==============');
    console.log(destroy);
    console.log('============ end destroy event ============');
  };
};