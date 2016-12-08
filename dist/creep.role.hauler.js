var utils = require('utils')

function hauler(creep) {
  // console.log(JSON.stringify(creep.memory))
  if (!creep.memory.state || creep.memory.state === '') {
    creep.memory['state'] = 'refill'
  }
  if(creep.memory.state === 'transport' && creep.carry.energy == 0) {
    creep.memory.state = 'refill'
  }
  if(creep.memory.state === 'refill'
     && creep.carry.energy == creep.carryCapacity) {
    creep.memory.state = 'transport'
  }

  if (creep.memory.state === 'refill') {
    if (!creep.memory.allocation) {
      console.log(creep.name,
                  'I don\'t have a source to work with!')
      delete creep.memory.role
      delete creep.memory.state
      return
    }
    else {
      collect_energy_by_allocation(creep)
    }
  }

  if (creep.memory.state === 'transport'){
    delete creep.memory.allocation
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
        utils.go_relax(creep)
      }
    }
  }
}

function collect_energy_by_allocation(creep) {
  var source = Game.getObjectById(creep.memory.allocation.id)
  if (!source) {
    console.log('I seem to have forgotten my destination as it doesn\'t seem '
      + 'to make sense anymore')
    delete creep.memory.allocation
    return
  }
  if (source.resourceType == RESOURCE_ENERGY){
    if(creep.pickup(source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source)
    }
  }
  else if (source.structureType == STRUCTURE_CONTAINER) {
    if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source)
    }
  }
  else {
    console.log('Something weird Happened!')
  }
}


module.exports = hauler
