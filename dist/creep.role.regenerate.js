var utils = require('utils')

function regenerate(creep) {
  if (creep.ticksToLive < 1500 * 0.90) {
    console.log(creep.name, 'is feeling a bit old and stiff with '
                + creep.ticksToLive + 'ticks to live!');
    var spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS)
    if(spawn) {
      if(spawn.renewCreep(creep) == ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn)
      }
    } else {
      utils.go_relax(creep)
    }
  } else {
    // feeling spritely again!
    console.log(creep.name, 'is feeling all young again with '
                + creep.ticksToLive + 'ticks to live!');
    delete creep.memory.role
  }
}

module.exports = regenerate
