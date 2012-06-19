module.exports = function(instance, user, client, connection) {

  return function(data) {
    console.log('============== data event ==============');
    console.log(data);
    console.log('============ end data event ============');
  };
};