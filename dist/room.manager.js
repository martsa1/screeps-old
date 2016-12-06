var unitTypes = require('creep.types')

var room = {}
var jobsList = []

var roomManager = {

  createJobsList: function() {
    // Get a reference to the room we are working in
    room = this
    jobsList = []

    let sources = room.find(FIND_SOURCES)
    .map((source) => ({
      id: source.id,
      type: 'source',
      prefType: 'miner'
    }))
    jobsList = jobsList.concat(sources)

    let droppedEnergy = room.find(FIND_DROPPED_ENERGY, {
      filter: (energy) => energy.amount >= 100
    })
    .map((energy) => ({
      id: energy.id,
      type: 'collect',
      amount: energy.amount,
      priority: 'high',
      prefType: 'carrier'
    }))
    jobsList = jobsList.concat(droppedEnergy)

    let mineContainers = room.find(FIND_MY_STRUCTURES, {
      filter: function(structure) {
        if (structure.structureType == STRUCTURE_CONTAINER) {
          let targets = structure.pos.findClosestInRange(sources, 2)
          if (targets) {
            return true
          }
        }
      }
    })
    .map((mineContainer) => ({
      id: mineContainer.id,
      type: 'collect',
      amount: _.sum(mineContainer.store),
      priority: 'mid',
      prefType: 'carrier'
    }))
    jobsList = jobsList.concat(mineContainers)

    let builds = room.find(FIND_MY_CONSTRUCTION_SITES)
    .map((site) => ({
      id: site.id,
      type: 'build',
      prefType: 'worker'
    })) // We only need to keep the site IDs (for now)
    jobsList = jobsList.concat(builds)

    let damagedStructures = room.lookForAtArea(
      LOOK_STRUCTURES, 0, 0, 49, 49, true)
    .map((object) => {
      return object.structure
    })
    .filter((structure) => {
      structure.hits< structure.hitsMax
    })
    .map((structure) => ({
      id: structure.id,
      type: 'repair',
      prefType: 'worker'
    }))
    jobsList = jobsList.concat(damagedStructures)

    let storageContainers = room.find(FIND_MY_STRUCTURES, {
      filter: function(structure) {
        if (structure.structureType === STRUCTURE_CONTAINER
            && _.sum(structure.store) < structure.storeCapacity) {
          let alreadyFound = false
          for (let i = 0; i < mineContainers.length; i ++) {
            if (mineContainers[i].id === structure.id) {
              alreadyFound = true
            }
          }
          if (!alreadyFound) return true
        }
      }
    })
    .map((storageContainer) => ({
      id: storageContainer.id,
      type: 'refill',
      amount: _.sum(storageContainer.store),
      priority: 'low',
      prefType: 'carrier'
    }))
    jobsList = jobsList.concat(storageContainers)

    let extensions = room.find(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return ((structure.structureType === 'extension'
                 || structure.structureType === 'spawn')
                && structure.energy < structure.energyCapacity)
      }
    })
    .map((extension) => ({
      id: extension.id,
      type: 'refill',
      priority: 'high',
      prefType: 'carrier'
    }))
    jobsList = jobsList.concat(extensions)


    let storage = room.storage
    if (storage) {
      storage = {
        id: storage.id,
        type: 'refill',
        priority: 'mid',
        prefType: 'carrier'
      }
      jobsList = jobsList.push(storage)
    }
    // console.log(JSON.stringify(jobsList));


    // Translate the array of jobs we have into a hash to make it easy to
    // reference stuff later!
    let result = jobsList.reduce((hash, element) => {
      hash[element.id] = {
        id: element.id,
        type: element.type ? element.type: undefined,
        priority: element.priority ? element.priority : undefined,
        prefType: element.prefType ? element.prefType : undefined,
      }
      return hash
    }, {})

    jobsList = result
  },

  workDispatch: function() {
    // Create an ordered list of creeps (hashes are not enumerable)
    room = this
    let unitsList = getUniqueUnitTypes()

    for (let unitType in unitsList){
      let workers_list = room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
          return (creep.memory.unit_type == unitType
          && creep.memory.role != 'regenerate'
          && creep.memory.role != 'upgrade')
        }
      })
      unitsList[unitType] = workers_list
    }

    allocateJobs(unitsList)


    // creeps_list.sort((first, next) => {
    //   if (first.Memory.lvl < next.memory.lvl) {
    //     return -1
    //   }
    //   if (first.Memory.lvl > next.memory.lvl) {
    //     return +1
    //   }
    //   return 0
    // })
    //
    //
    // for (var count in creeps_assignments) {
    //   try {
    //     if (creeps_list.length > 0) {
    //       var creep = Game.creeps[creeps_list.shift().name]
    //       creep.memory.role = creeps_assignments[count]
    //     } else {
    //       break
    //     }
    //   } catch (err) {
    //     console.log(err)
    //   }
    // }
    // if (creeps_assignments.length- 1 - count != 0) {
    //   console.log('We have a ', creeps_assignments.length- 1 - count,
    //         'worker deficit!')
    // }
    //
    // if (creeps_list.length > 0) {
    //   console.log('We have a worker Surplus!')
    //   for (let count = 0; count < creeps_list.length; count ++) {
    //     creep = Game.creeps[creeps_list.shift().name]
    //     console.log(creep.name, 'is heading for retirement!')
    //     creep.memory['role'] = 'recycle'
    //   }
    // }
  },

  minersUnion: function(room) {
    var needed_miners = room.find(FIND_SOURCES).length

      // Create an ordered list of creeps (hashes are not numbered)
    var creeps_list = _.filter(
        Game.creeps, (creep) => (
          creep.memory.unit_type == 'miner'
          && creep.memory.role != 'regenerate'
          && creep.memory.role != 'upgrade'
        )
      )

    if (!creeps_list) {
      return
    }

    for (var bug in creeps_list) {
      var creep = Game.creeps[creeps_list[bug].name]
      creep.memory.role = 'extractor'
    }
    if (creeps_list.length < needed_miners) {
      console.log('We have a ', needed_miners - creeps_list.length,
            'miner deficit!')
    }

    if (creeps_list.length > needed_miners) {
      console.log('We have a miner Surplus!')
    }
  },

  carriersUnion: function(room) {
    var needed_haulers = room.find(FIND_MY_CREEPS, {
      filter: function(creep) {
        return creep.memory.role == 'extractor'
      }
    }).length
    // console.log('Needed Haulers:', needed_carriers)

      // Create an ordered list of creeps (hashes are not numbered)
    var creeps_list = room.find(FIND_MY_CREEPS, {
      filter: function(creep) {
        return (creep.memory.unit_type == 'carrier'
                && creep.memory.role != 'regenerate'
                && creep.memory.role != 'upgrade')
      }
    })

    if (!creeps_list) {
      console.log('No Creeps found matching carrier type!')
      return
    }

    for (var bug in creeps_list) {
      // console.log('Assigning', creeps_list[bug].name, 'A Hauler role!')
      var creep = Game.creeps[creeps_list[bug].name]
      creep.memory.role = 'hauler'
    }
    if (creeps_list.length < needed_haulers) {
      console.log('We have a ', needed_haulers - creeps_list.length,
            'hauler deficit!')
    }

    if (creeps_list.length > needed_haulers) {
      console.log('We have a hauler Surplus!')
    }
  }


}

function getUniqueUnitTypes() {
  let units = {}
  for (let unit in unitTypes) {
    let alreadyGot = false
    unit = unit.split('_')[0]
    for (let item in Object.keys(units)) {
      if (item === unit) {
        alreadyGot = true
      }
    }
    if (!alreadyGot) {
      units[unit] = {}
    }
  }
  return units
}

function allocateJobs(unitsList) {
  for (let unit in unitsList) {
    let relevantJobs = _.filter(jobsList, (job) => {
      return (job.prefType === unit && !job.allocation)
    })
    switch (unit) {
      case 'miner' :
        pushAssignmentToWorker(relevantJobs, 'miner')
        // let miners = room.find(FIND_MY_CREEPS, {
        //   filter: (creep) => {
        //     return creep.memory.unit_type === 'miner'
        //   }
        // })
        // for (let job in relevantJobs) {
        //   console.log('Found a miner job!',
        //               JSON.stringify(relevantJobs[job]));
        //   let creep = miners.pop()
        //   if (creep) {
        //     creep.memory.allocation = relevantJobs[job].id
        //     jobsList[relevantJobs[job].id]['allocation'] = creep.id
        //   }
        // }
        break

      case 'carrier':
        pushAssignmentToWorker(relevantJobs, 'carrier')
        // let carriers = room.find(FIND_MY_CREEPS, {
        //   filter: (creep) => {
        //     return creep.memory.unit_type === 'carrier'
        //   }
        // })
        // for (let job in relevantJobs) {
        //   console.log('Found a carrier job!',
        //               JSON.stringify(relevantJobs[job]));
        //   let creep = carriers.pop()
        //   if (creep){
        //     creep.memory.allocation = relevantJobs[job].id
        //     jobsList[relevantJobs[job].id]['allocation'] = creep.id
        //   }
        // }
        break

      case 'worker':
        pushAssignmentToWorker(relevantJobs, 'worker')
        // let workers = room.find(FIND_MY_CREEPS, {
        //   filter: (creep) => {
        //     return creep.memory.unit_type === 'worker'
        //   }
        // })
        // for (let job in relevantJobs) {
        //   console.log('Found a worker job!',
        //               JSON.stringify(relevantJobs[job]));
        //   let creep = workers.pop()
        //   if (creep) {
        //     creep.memory.allocation = relevantJobs[job].id
        //     jobsList[relevantJobs[job].id]['allocation'] = creep.id
        //   }
        // }
        break
    }
    // let creep = unitsList[unit]
    // console.log(JSON.stringify(relevantJobs));
    // console.log(JSON.stringify(unitsList));
  }
  room.memory['jobsList'] = jobsList
}

function pushAssignmentToWorker(relevantJobs, unitType) {
  let unit = room.find(FIND_MY_CREEPS, {
    filter: (creep) => {
      return creep.memory.unit_type === unitType
    }
  })
  for (let job in relevantJobs) {
    // console.log('Found a %d job: %d', unitType, JSON.stringify(relevantJobs[job]));
    let creep = unit.pop()
    if (creep) {
      creep.memory.allocation = relevantJobs[job].id
      jobsList[relevantJobs[job].id]['allocation'] = creep.id
    }
  }
}

module.exports = roomManager
