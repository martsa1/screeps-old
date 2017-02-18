var utils = require('utils')

function builder(creep) {
  if (!creep.memory.state) {
    creep.memory.state = 'refill'
  }
  if(creep.memory.state === 'build' && creep.carry.energy == 0) {
    creep.memory.state = 'refill'
  }
  if(creep.memory.state === 'refill'
     && creep.carry.energy == creep.carryCapacity) {
    creep.memory.state = 'build'
  }

  var target = {}

  if(creep.memory.state === 'build' && creep.memory.allocation) {
    target = Game.getObjectById(creep.memory.allocation.id)
    if(target) {
      if (creep.memory.allocation.type === 'repair') {
        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target)
        }
        if (target.hits === target.hitsMax) {
          console.log('Repair job complete');
          delete creep.memory.allocation
          delete creep.memory.role
          delete creep.memory.state
          utils.go_relax(creep)
        }
      }
      else if(creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target)
      }
    }
    else {
      console.log(creep.name, 'Doesn\'t appear to have an allocation.');
      delete creep.memory.allocation
      delete creep.memory.role
      delete creep.memory.state
      utils.go_relax(creep)
    }
  }
  else {
    utils.collect_nearest_energy(creep)
  }
}

module.exports = builder
