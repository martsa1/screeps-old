
var room = {}

var jobsList = []

var createJobsList = function() {
  // Get a reference to the room we are working in
  room = this

  jobsList = room.find(FIND_MY_CONSTRUCTION_SITES)
  .map((site) => ({
    id: site.id,
    type: 'build'
  })) // We only need to keep the site IDs (for now)

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
    type: 'repair'
  }))
  jobsList = jobsList.concat(damagedStructures)

  let sources = room.find(FIND_SOURCES)
  .map((source) => ({
    id: source.id,
    type: 'source'
  }))
  jobsList = jobsList.concat(sources)


  let droppedEnergy = room.find(FIND_DROPPED_ENERGY, {
    filter: (energy) => energy.amount >= 100
  })
  .map((energy) => ({
    id: energy.id,
    type: 'collect',
    amount: energy.amount,
    priority: 'high'
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
    priority: 'mid'
  }))
  jobsList = jobsList.concat(mineContainers)

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
    priority: 'low'
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
    priority: 'high'
  }))
  jobsList = jobsList.concat(extensions)


  let storage = room.storage
  if (storage) {
    storage = {
      id: storage.id,
      type: 'refill',
      priority: 'mid'
    }
    jobsList = jobsList.push(storage)
  }

  console.log(JSON.stringify(jobsList));
}

module.exports = createJobsList
