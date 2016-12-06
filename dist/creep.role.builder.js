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
    target = Game.getObjectById(creep.memory.allocation)
    if(target) {
      if(creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target)
      }
    }
    else {
      console.log(creep.name, 'Don\'t appear to have an allocation.');
      delete creep.memory.allocation
      utils.go_relax(creep)
    }
    // target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
    // else {
    //   target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
    //     filter: (structure) => (
    //       structure.hits < structure.hitsMax * 0.95 &&
    //       structure.structureType != STRUCTURE_WALL &&
    //       structure.structureType != STRUCTURE_RAMPART
    //     )
    //   })
    //   if(target) {
    //     if(creep.repair(target) == ERR_NOT_IN_RANGE) {
    //       creep.moveTo(target)
    //     }
    //   }
    //   else {
    //     target = creep.pos.findClosestByRange(FIND_STRUCTURES,
    //       {
    //         filter: (structure) => (
    //           structure.hits <= Memory.defense.wall_health &&
    //           (structure.structureType == STRUCTURE_WALL ||
    //           structure.structureType == STRUCTURE_RAMPART)
    //         )
    //       }
    //     )
    //     if(target) {
    //       if(creep.repair(target) == ERR_NOT_IN_RANGE) {
    //         creep.moveTo(target)
    //       }
    //     } else {
    //       utils.go_relax(creep)
    //     }
    //   }
    // }
  }
  else {
    utils.collect_nearest_energy(creep)
  }
}

module.exports = builder
