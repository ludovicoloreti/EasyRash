/*
 *  Class LockManager
 *
 *  It has the aim to handle all the article related locks.
 *  When an user enters the annotator-mode it acquires the lock for the requested article. If the lock is
 *  already taken the manager retunrs false.
 *  When an user exits the annotator-mode it releases the lock fot the specified resource.
 *
 *
*/
function LockManager(){

  // LockManager
  var self = this;
  // Dictionary containing all locks
  var lockDictionary = new Map();
  // 4 hours expiration time
  var expirationTime = 1000*60*60*4;

  // AcquireLock function: it acquires the lock if absent or expired
  self.acquireLock = function(lockName, userId, callback){
    // Check if the lock is present
    if( lockDictionary.has(lockName) ){
      var lock = lockDictionary.get(lockName);

      // If the lock is taken return false
      if(!isExpired(lock) ){
        callback(false);
      }else {

        var lockObject = {
          "name": lockName,
          "userId": userId,
          "date": new Date()
        }
        // Set the lock
        lockDictionary.set(lockName, lockObject);
      }
    } else {
      // If the lock is not taken, create and return true
      var lockObject = {
        "name": lockName,
        "userId": userId,
        "date": new Date()
      }
      // Set the lock
      lockDictionary.set(lockName, lockObject);
      callback(true);
    }
  };

  // Internal function: checks if the lock is expired
  function isExpired(lock){
    var currentDate = new Date().getTime();
    var lockDate = lock.date.getTime();

    return expirationTime < (currentDate - lockDate);
  }

  // releseLock function: release the lock if present
  self.releaseLock = function(lockName, callback){
    if( lockDictionary.has(lockName) ){
      lockDictionary.delete(lockName);
      callback(true);
    }else {
      callback(false);
    }
  };

  return self;
}

// Export the manager
module.exports = new LockManager();
