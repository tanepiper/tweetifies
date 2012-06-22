module.exports = function(instance, user, remote) {

  return function(destroy) {
    console.log('============== destroy event ==============');
    console.log(destroy);
    console.log('============ end destroy event ============');
  };
};