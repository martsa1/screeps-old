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
      utils.go_relax(creep)
      // get_extractor_buddy(creep, room)
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

// function get_extractor_buddy(creep, room) {
//   console.log('Finding a source');
//   var haulers = room.find(FIND_MY_CREEPS, {
//     filter: function(unit) {
//       return unit.memory.role == 'hauler'
//     }
//   })
//
//   var sources = room.find(FIND_DROPPED_ENERGY,  {
//     filter: function(energy) {
//       return energy.amount >= creep.carryCapacity * 0.5
//     }
//   })
//   sources = sources.concat(room.find(FIND_STRUCTURES,  {
//     filter: function(structure) {
//       return structure.structureType == STRUCTURE_CONTAINER
//     }
//   }))
//   // console.log(JSON.stringify(sources));
//   if (sources.length > 0){
//     sources = sources.map(({ id }) => id)
//       .reduce((former, next) => {
//         // console.log(former, next);
//         var alreadyAllocated = false
//         for (let name in haulers) {
//           let otherCreep = haulers[name]
//           if (otherCreep.name === creep.name) {
//             continue
//           }
//           // console.log(otherCreep.name, ', memory:',
//           //   JSON.stringify(otherCreep.memory))
//           if (otherCreep.memory.targetID
//               && otherCreep.memory.targetID === former) {
//             alreadyAllocated = true
//             console.log('Found a source allocated to someone else, ignoring')
//             break
//           }
//           if (!alreadyAllocated) {
//             return former
//           }
//           else {
//             console.log('Found an unallocated source')
//             return next
//           }
//         }
//       })
//     if (sources) {
//       creep.memory.targetID = sources
//       console.log(JSON.stringify(sources))
//       console.log(creep.name, 'found a source:', creep.memory.targetID);
//     }
//   }
//   else {
//     console.log(JSON.stringify(sources))
//     console.log(creep.name, 'can\'t find a source!')
//     utils.go_relax(creep)
//   }
// }

function collect_energy_by_allocation(creep) {
  var source = Game.getObjectById(creep.memory.allocation)
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
