module.exports = function(instance, socket) {

  return function(error) {
    console.log('============== error event ==============');
    console.log(error);
    console.log('============ end error event ============');
    socket.emit('error', error);
  };
};