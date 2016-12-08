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
      priority: 0,
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
      priority: 1,
      prefType: 'carrier'
    }))
    jobsList = jobsList.concat(mineContainers)

    let job = {
      id: room.controller.id,
      type: 'upgrade',
      role: 'upgrader',
      prefType: 'worker',
      priority: 0
    }
    if (room.controller.level < 2) {
      // We should focus on upgrading the room, not building stuff!
      job.level = 2
      jobsList.push(job, job, job, job, job)
    }
    else {
      job.level = room.controller.level + 1
      jobsList.push(job) //Just allocate a single upgrader for now.
    }

    let builds = room.find(FIND_MY_CONSTRUCTION_SITES)
    .map((site) => ({
      id: site.id,
      type: 'build',
      role: 'builder',
      prefType: 'worker',
      priority: site.structureType === STRUCTURE_EXTENSION ? 0 : 1
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
      prefType: 'worker',
      priority: (structure.structureType !== STRUCTURE_WALL
                 && structure.structureType !== STRUCTURE_RAMPART) ? 0 : 1
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
      role: 'hauler',
      amount: _.sum(storageContainer.store),
      priority: 2,
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
      role: 'hauler',
      priority: 0,
      prefType: 'carrier'
    }))
    jobsList = jobsList.concat(extensions)


    let storage = room.storage
    if (storage) {
      storage = {
        id: storage.id,
        type: 'refill',
        role: 'hauler',
        priority: 1,
        prefType: 'carrier'
      }
      jobsList = jobsList.push(storage)
    }

    // Translate the array of jobs we have into a hash to make it easy to
    // reference stuff later!
    let result = jobsList.reduce((hash, element) => {
      hash[element.id] = {}
      for (let key in element) {
        hash[element.id][key] = element[key]
      }
      return hash
    }, {})

    jobsList = pruneExistingJobs(result)
    room.memory['jobsList'] = jobsList
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
      case 'miner' :{
        pushAssignmentToWorker(relevantJobs, 'miner')
        break
      }

      case 'carrier': {
        relevantJobs.sort((former, latter) => {
          if (former.priority < latter.priority) {
            return -1
          }
          else if (former.priority > latter.priority) {
            return +1
          }
          else {
            return 0
          }
        })
        relevantJobs = _.filter(relevantJobs, (job) => {
          return job.type !== 'refill'
        })
        pushAssignmentToWorker(relevantJobs, 'carrier')
        break
      }

      case 'worker': {
        relevantJobs.sort((former, latter) => {
          if (former.priority < latter.priority) {
            return -1
          }
          else if (former.priority > latter.priority) {
            return +1
          }
          else {
            return 0
          }
        })
        // console.log(JSON.stringify(relevantJobs));
        pushAssignmentToWorker(relevantJobs, 'worker')
        break
      }
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
      creep.memory.allocation = relevantJobs[job]
      creep.memory.role = relevantJobs[job].role
      // console.log(JSON.stringify(relevantJobs[job]))
    }
  }
}

function pruneExistingJobs(jobsList) {
  // Remove any existing allocations from the list
  let creepAllocations = room.find(FIND_MY_CREEPS, {
    filter: (creep) => {
      return creep.memory.allocation
    }
  })
  .map((creep) => {
    return creep.memory.allocation.id
  })

  for (let job in jobsList) {
    for (let allocation in creepAllocations) {
      if (creepAllocations[allocation] === jobsList[job].id) {
        // console.log('Found existing job allocation:',
        //             JSON.stringify(jobsList[job]))
        delete jobsList[job]
        break
      }
    }
  }
  return jobsList
}

module.exports = roomManager
