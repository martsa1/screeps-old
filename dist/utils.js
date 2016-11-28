var utils = {

  equals: function (array1, array2) {
        // if the arrays are a falsy value, return
    if (!array1 || !array2)
      return false

        // compare lengths - can save a lot of time
    if (array1.length != array2.length)
      return false

    for (var i = 0, l=array1.length; i < l; i++) {
            // Check if we have nested arrays
      if (array1[i] instanceof Array && array2[i] instanceof Array) {
                // recurse into the nested arrays
        if (!array1[i].equals(array2[i]))
          return false
      }
      else if (array1[i] != array2[i]) {
                // Warning - two different object instances will never be
                // equal: {x:20} != {x:20}
        return false
      }
    }
    return true
  },

  harvest_nearest_energy: function (creep) {
    var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source)
    }
  },


  find_nearest_energy_collection_point: function(creep) {
    var source = {}
    source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => (
                  structure.structureType == STRUCTURE_STORAGE &&
                  structure.store[RESOURCE_ENERGY] > 0
                )

    })
    if (source) {
      return source
    } else {
      source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => (
                  structure.structureType == STRUCTURE_CONTAINER
                  && structure.store[RESOURCE_ENERGY] > 0
                )
      })
      if (source) {
        return source
      } else {
        source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (structure) => (
            (structure.structureType == STRUCTURE_SPAWN
            || structure.structureType == STRUCTURE_EXTENSION)
            && structure.energy >= structure.energyCapacity * 0.8
          )
        })
        if (source) {
          return source
        }
      }
    }
    return false
  },

  collect_nearest_energy: function (creep) {
    var source = this.find_nearest_energy_collection_point(creep)
    if (source) {
      if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source)
      }
    } else {
      this.go_relax(creep)
    }
  },

  go_relax: function(creep) {
    var flag = creep.pos.findClosestByRange(FIND_FLAGS)
    if (flag) {
      creep.moveTo(flag)
    }
  },

  get_spawn: function() {
    for (var i in Game.spawns) {
      return Game.spawns[i]
    }
  },

  get_flag: function() {
    for (var i in Game.flags) {
      return Game.flags[i]
    }
  },

  get_full_extractor: function(creep) {
    // var source = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
    //   filter: (extractor) => {
    //     extractor.memory.role == 'harvester' &&
    //           extractor.carry[RESOURCE_ENERGY] > 0
    //   }
    // })
    // var fullest = _.max(source)
    // if (fullest == '-Infinity') {
    //   return
    // } else {
    //   console.log('Returning Fullest creep!')
    //   return fullest
    // }
    return false
  }
}

module.exports = utils
