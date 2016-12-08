var utils = require('utils')

function upgrader(creep) {
  if (!creep.memory.state
      || (creep.memory.state !== 'upgrade'
          && creep.memory.state !== 'refill')) {
    creep.memory.state = 'refill'
  }

  if(creep.memory.state === 'upgrade' && creep.carry.energy == 0) {
    creep.memory.state = 'refill'
  }
  if(creep.memory.state === 'refill'
      && creep.carry.energy == creep.carryCapacity) {
    creep.memory.state = 'upgrade'
  }

  if (!creep.memory.allocation) {
    delete creep.memory.role
    delete creep.memory.state
  }

  if(creep.memory.state === 'upgrade') {
    let target = Game.getObjectById(creep.memory.allocation.id)
    if (!target) {
      delete creep.memory.allocation
      delete creep.memory.state
      delete creep.memory.role
      return
    }

    if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target)
    }

    if (target.level === creep.memory.allocation.level) {
      console.log('Upgrade Job completed');
      delete creep.memory.allocation
      delete creep.memory.state
      delete creep.memory.role
      return
    }

  }
  else {
    utils.collect_nearest_energy(creep)
  }
}

module.exports = upgrader
