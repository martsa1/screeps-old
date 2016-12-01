var utils = require('utils')

function distributor(creep) {
  if(creep.memory.state && creep.carry.energy == 0) {
    creep.memory.state = false
  }
  if(!creep.memory.state && creep.carry.energy == creep.carryCapacity) {
    creep.memory.state = true
  }

  if (!creep.memory.state) {
    var source = utils.find_nearest_energy_collection_point(creep)
    // console.log(JSON.stringify(source));
    if (source && (source.structureType !== STRUCTURE_SPAWN
        && source.structureType !== STRUCTURE_EXTENSION)) {
      if (source.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source)
      }
    }
    else
    {
      utils.go_relax(creep)
    }
  }

  if (creep.memory.state){
    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => {
        return (
          (structure.structureType == STRUCTURE_EXTENSION
          || structure.structureType == STRUCTURE_SPAWN)
          && structure.energy < structure.energyCapacity)
      }
    })
    if(target) {
      if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target)
      }
    }
    else {
      var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            (structure.structureType == STRUCTURE_TOWER)
            && structure.energy < structure.energyCapacity
          )
        }
      })
      if(target) {
        if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target)
        }
      }
      else {
        creep.moveTo(Game.flags.Chillout)
      }
    }
  }
}

module.exports = distributor
