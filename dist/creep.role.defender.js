var utils = require('utils')

function defender(creep) {
  var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)

  if(target) {
    console.log ('Found an Invader!')
    if(creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target)
    }
  }
  else {
    utils.go_relax(creep)
  }
}

module.exports = defender
