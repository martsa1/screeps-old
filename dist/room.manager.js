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
      role: 'extractor',
      prefType: 'miner'
    }))
    jobsList = jobsList.concat(sources)

    let droppedEnergy = room.find(FIND_DROPPED_ENERGY, {
      filter: (energy) => energy.amount >= 100
    })
    .map((energy) => ({
      id: energy.id,
      type: 'collect',
      role: 'hauler',
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
      role: 'hauler',
      amount: _.sum(mineContainer.store),
      priority: 'mid',
      prefType: 'carrier'
    }))
    jobsList = jobsList.concat(mineContainers)

    let builds = room.find(FIND_MY_CONSTRUCTION_SITES)
    .map((site) => ({
      id: site.id,
      type: 'build',
      role: 'builder',
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
      role: 'builder',
      prefType: 'worker'
    }))
    jobsList = jobsList.concat(damagedStructures)

    // let storageContainers = room.find(FIND_MY_STRUCTURES, {
    //   filter: function(structure) {
    //     if (structure.structureType === STRUCTURE_CONTAINER
    //         && _.sum(structure.store) < structure.storeCapacity) {
    //       let alreadyFound = false
    //       for (let i = 0; i < mineContainers.length; i ++) {
    //         if (mineContainers[i].id === structure.id) {
    //           alreadyFound = true
    //         }
    //       }
    //       if (!alreadyFound) return true
    //     }
    //   }
    // })
    // .map((storageContainer) => ({
    //   id: storageContainer.id,
    //   type: 'refill',
    //   role: 'hauler',
    //   amount: _.sum(storageContainer.store),
    //   priority: 'low',
    //   prefType: 'carrier'
    // }))
    // jobsList = jobsList.concat(storageContainers)

    // let extensions = room.find(FIND_MY_STRUCTURES, {
    //   filter: (structure) => {
    //     return ((structure.structureType === 'extension'
    //              || structure.structureType === 'spawn')
    //             && structure.energy < structure.energyCapacity)
    //   }
    // })
    // .map((extension) => ({
    //   id: extension.id,
    //   type: 'refill',
    //   role: 'hauler',
    //   priority: 'high',
    //   prefType: 'carrier'
    // }))
    // jobsList = jobsList.concat(extensions)
    //
    //
    // let storage = room.storage
    // if (storage) {
    //   storage = {
    //     id: storage.id,
    //     type: 'refill',
    //     role: 'hauler',
    //     priority: 'mid',
    //     prefType: 'carrier'
    //   }
    //   jobsList = jobsList.push(storage)
    // }

    // Translate the array of jobs we have into a hash to make it easy to
    // reference stuff later!
    let result = jobsList.reduce((hash, element) => {
      hash[element.id] = {
        id: element.id,
        type: element.type ? element.type: undefined,
        role: element.role ? element.role: undefined,
        priority: element.priority ? element.priority : undefined,
        prefType: element.prefType ? element.prefType : undefined,
      }
      return hash
    }, {})

    // Remove any existing allocations from the list
    for (let job in result) {
      if (room.memory.jobsList[job] && room.memory.jobsList[job].allocation) {
        // console.log('Found existing job allocation:',
        //             JSON.stringify(room.memory.jobsList[job]));
        delete result[job]
      }
    }

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
        break

      case 'carrier':
        // console.log(JSON.stringify(relevantJobs));
        pushAssignmentToWorker(relevantJobs, 'carrier')
        break

      case 'worker':
        if (room.controller.level < 2) {
          // We should focus on upgrading the room, not building stuff!
          relevantJobs.forEach((job) => {
            job.id = room.controller.id
            job.type = 'upgrade'
            job.role = 'upgrader'
          })
        }
        pushAssignmentToWorker(relevantJobs, 'worker')
        break
    }
    // console.log(JSON.stringify(relevantJobs));
    // console.log(JSON.stringify(unitsList));
  }
  room.memory['jobsList'] = jobsList
}

function pushAssignmentToWorker(relevantJobs, unitType) {
  let unit = room.find(FIND_MY_CREEPS, {
    filter: (creep) => {
      return creep.memory.unit_type === unitType && !creep.memory.allocation
    }
  })
  for (let job in relevantJobs) {
    // console.log('Found a %d job: %d', unitType,
    //             JSON.stringify(relevantJobs[job]));
    let creep = unit.shift()
    if (creep) {
      creep.memory.allocation = relevantJobs[job].id
      creep.memory.role = relevantJobs[job].role
      // console.log(JSON.stringify(relevantJobs[job]))
      if (relevantJobs[job].type !== 'upgrade'){
        jobsList[relevantJobs[job].id]['allocation'] = creep.id
      }
    }
  }
}

module.exports = roomManager
