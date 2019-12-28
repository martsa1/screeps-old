var utils = require('utils')

if (!Memory.population) {
  Memory.population = {
    builder: 2,
  }
} else if (!Memory.population.builder) {
  Memory.population['builder'] = 2
}

function builder(creep) {
  if(creep.memory.state && creep.carry.energy == 0) {
    creep.memory.state = false
  }
  if(!creep.memory.state && creep.carry.energy == creep.carryCapacity) {
    creep.memory.state = true
  }

  var target = {}

  if(creep.memory.state) {
    target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
    if(target) {
      if(creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target)
      }
    }
    else {
      target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => (
          structure.hits < structure.hitsMax * 0.95 &&
          structure.structureType != STRUCTURE_WALL &&
          structure.structureType != STRUCTURE_RAMPART
        )
      })
      if(target) {
        if(creep.repair(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target)
        }
      }
      else {
        target = creep.pos.findClosestByRange(FIND_STRUCTURES,
          {
            filter: (structure) => (
              structure.hits <= Memory.defense.wall_health &&
              (structure.structureType == STRUCTURE_WALL ||
              structure.structureType == STRUCTURE_RAMPART)
            )
          }
        )
        if(target) {
          if(creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
          }
        } else {
          utils.go_relax(creep)
        }
      }
    }
  }
  else {
    utils.collect_nearest_energy(creep)
  }
}

module.exports = builder
