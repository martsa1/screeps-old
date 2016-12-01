function hauler(creep, room) {
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
    if (!creep.memory.extractorTarget) {
      console.log(creep.name, 'I don\'t have a hauler to work with, looking for one!')
      get_extractor_buddy(creep, room)
    }
    else {
      console.log(creep.name, 'collecting energy from', JSON.stringify(creep.memory.extractorTarget))
      collect_energy_by_extractorTarget(creep, room)
    }
  }

  if (creep.memory.state === 'transport'){
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

function get_extractor_buddy(creep, room) {
  console.log('Finding a source');
  var haulers = room.find(FIND_MY_CREEPS, (extractor) => (
    extractor.memory.role == 'hauler'
  ))
  creep.memory.extractorTarget = room.find(FIND_DROPPED_ENERGY)
    .map(({ id }) => id)
    .reduce((former, next) => {
      console.log(former, next);
      var alreadyAllocated = false
      for (let name in haulers) {
        let otherCreep = haulers[name]
        console.log(JSON.stringify(otherCreep.memory))
        if (otherCreep.memory.extractorTarget
            && otherCreep.memory.extractorTarget === former) {
          alreadyAllocated = true
          console.log('Found a source allocated to someone else, ignoring')
          break
        }
        if (!alreadyAllocated) {
          return former
        }
        else {
          console.log('Found an unallocated source')
          return next
        }
      }
    })
  console.log(creep.name, 'found a source:', creep.memory.extractorTarget);

}

function collect_energy_by_extractorTarget(creep) {
  var source = Game.getObjectById(creep.memory.extractorTarget)
  if (!source) {
    console.log('I seem to have forgotten my destination as it doesn\'t seem '
      + 'to make sense anymore')
    delete creep.memory.sourceAllocation
  }
  // console.log('Source:', JSON.stringify(source))
  if(creep.pickup(source) == ERR_NOT_IN_RANGE) {
    creep.moveTo(source)
  }
}


module.exports = hauler
