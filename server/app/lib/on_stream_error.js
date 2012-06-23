module.exports = function(instance, dnode) {

  return function(error) {
    console.log('============== error event ==============');
    console.log(error);
    console.log('============ end error event ============');
    dnode.proto.remote.onError(error);
  };
};