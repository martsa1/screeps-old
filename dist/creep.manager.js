var unit_roles = require('creep.roles')
var unit_type = require('creep.types')

var utils = require('utils')

if (!Memory.defense) {
  Memory.defense = {
    wall_health: 5000
  }
}

var manager = {
  manage: function(current_room) {
    undertaker()
    spawn_units(current_room)
    minersUnion(current_room)
    carriersUnion(current_room)
    workersUnion(current_room)
  },

  run: function(current_room) {
    for(var name in Game.creeps) {
      // Run our creeps behaviour
      var creep = Game.creeps[name]
      if (creep.memory.role) {
        try {
          // console.log(creep.name, ', Role:', creep.memory.role)
          unit_roles[creep.memory.role](creep, current_room)
        } catch (err) {
          console.log(creep.name, 'caught amnesia, former role:',
                      creep.memory.role, ', unsetting role:', err.stack)
          delete creep.memory['role']
        }
      }
    }
  }
}

function undertaker() {
  for(var name in Memory.creeps) {
    if(!Game.creeps[name]) {
      delete Memory.creeps[name]
      console.log('Today we mourn the passing of', name)
    }
    var creep = Game.creeps[name]
    if (creep) {
      if (creep.ticksToLive < 100 && creep.memory.role != 'regenerate') {
        console.log(creep.name, 'is getting old and is finally '
                      + 'entitled to some regeneration!')
        creep.memory.role = 'regenerate'
      }
    }
  }
}

function spawn_units(current_room) {
  var max_build_energy = current_room.energyCapacityAvailable
  // console.log(JSON.stringify(current_room))
  // console.log('max:',max_build_energy, 'Available:',
  //             current_room.energyAvailable)

  var needed_workers = Memory.population.builder
      + Memory.population.harvester
      + Memory.population.upgrader || 0
  var needed_carriers = Memory.population.hauler
      + Memory.population.distributor || 0
  var needed_miners = current_room.find(FIND_SOURCES).length
  var needed_fighters = Memory.population.defender || 0

  var population_workers = _.filter(
    Game.creeps, (creep) => (
      creep.memory.unit_type == 'worker'
      && creep.memory.role != 'upgrade'
    )
  )

  var population_carriers = _.filter(
    Game.creeps, (creep) => (
      creep.memory.unit_type == 'carrier'
      && creep.memory.role != 'upgrade'
    )
  )

  var population_miners = _.filter(
    Game.creeps, (creep) => (
      creep.memory.unit_type == 'miner'
      && creep.memory.role != 'upgrade'
    )
  )

  var population_regenerates = _.filter(
    Game.creeps, (creep) => (
      creep.memory.role == 'regenerate'
    )
  )

  var population_fighters = _.filter(Game.creeps, (creep) =>
    creep.memory.unit_type == 'defender'
  )

  var population_unknown = _.filter(Game.creeps, (creep) =>
    !creep.memory.unit_type
  )


  // console.log('Needed Workers:', needed_workers, 'Worker pop:',
  //             population_workers.length)
  // console.log('Needed Fighters:', needed_fighters, ', Fighter pop:',
  //             population_fighters.length)
  // console.log('Unknown Pop:', population_unknown.length)

  if (population_workers.length < needed_workers
    && population_regenerates.length == 0) {
      // We have a deficit of workers, lets spawn some more!
    if (max_build_energy >= unit_type.worker_3.u_cost) {
      if (_.filter(
        Game.creeps, (creep) => (
          creep.memory.role == Memory.socialStructure[0])
        ).length  < Memory.population[Memory.socialStructure[0]]
      ) {
        // We shouldn't really get here, but in case all our units are
        // dead or something...
        console.log('Emergency Spawning lvl1 Worker')
        var newby = utils.get_spawn().createCreep(
              unit_type.worker_1.u_body,
              undefined,
              unit_type.worker_1.u_mem)
        return
      }
      console.log('Spawning lvl3 Worker')
      newby = utils.get_spawn().createCreep(
            unit_type.worker_3.u_body,
            undefined,
            unit_type.worker_3.u_mem)
      console.log(newby)
    }
    else if (max_build_energy >= unit_type.worker_2.u_cost) {
      if (_.filter(
            Game.creeps, (creep) => (
              creep.memory.role == Memory.socialStructure[0])
            ).length < Memory.population[Memory.socialStructure[0]]
          ) {
            // We shouldn't really get here, but in case all our units are
            // dead or something...
        console.log('Emergency Spawning lvl1 Worker')
        newby = utils.get_spawn().createCreep(
              unit_type.worker_1.u_body,
              undefined,
              unit_type.worker_1.u_mem)
        return
      }
      console.log('Spawning lvl2 Worker')
      newby = utils.get_spawn().createCreep(
            unit_type.worker_2.u_body,
            undefined,
            unit_type.worker_2.u_mem)
    }
    else if (max_build_energy >= unit_type.worker_1.u_cost) {
      console.log('Spawning lvl1 Worker')
      newby = utils.get_spawn().createCreep(
            unit_type.worker_1.u_body,
            undefined,
            unit_type.worker_1.u_mem)
    }
  }

  if (population_carriers.length < needed_carriers
    && population_regenerates.length == 0) {
      // We have a deficit of workers, lets spawn some more!
    if (max_build_energy >= unit_type.carrier_3.u_cost) {
      if (_.filter(
        Game.creeps, (creep) => (
          creep.memory.role == Memory.socialStructure[0])
        ).length  < Memory.population[Memory.socialStructure[0]]
      ) {
        // We shouldn't really get here, but in case all our units are
        // dead or something...
        console.log('Emergency Spawning lvl1 Worker')
        newby = utils.get_spawn().createCreep(
              unit_type.worker_1.u_body,
              undefined,
              unit_type.worker_1.u_mem)
        console.log(newby)
        return
      }
      console.log('Spawning lvl3 Carrier')
      newby = utils.get_spawn().createCreep(
            unit_type.carrier_3.u_body,
            undefined,
            unit_type.carrier_3.u_mem)
      console.log(newby)
    }
    else if (max_build_energy >= unit_type.carrier_2.u_cost) {
      if (_.filter(
            Game.creeps, (creep) => (
              creep.memory.role == Memory.socialStructure[0])
            ).length < Memory.population[Memory.socialStructure[0]]
          ) {
            // We shouldn't really get here, but in case all our units are
            // dead or something...
        console.log('Emergency Spawning lvl1 Worker')
        newby = utils.get_spawn().createCreep(
              unit_type.worker_1.u_body,
              undefined,
              unit_type.worker_1.u_mem)
        return
      }
      console.log('Spawning lvl2 Carrier')
      newby = utils.get_spawn().createCreep(
            unit_type.carrier_2.u_body,
            undefined,
            unit_type.carrier_2.u_mem)
      console.log(newby)
    }
    else if (max_build_energy >= unit_type.carrier_1.u_cost) {
      console.log('Spawning lvl1 Carrier')
      newby = utils.get_spawn().createCreep(
            unit_type.carrier_1.u_body,
            undefined,
            unit_type.carrier_1.u_mem)
    }
  }

  if (population_miners.length < needed_miners
    && population_regenerates.length == 0) {
      // We have a deficit of workers, lets spawn some more!
    if (max_build_energy >= unit_type.miner_3.u_cost) {
      console.log('Spawning lvl3 Miner')
      newby = utils.get_spawn().createCreep(
            unit_type.miner_3.u_body,
            undefined,
            unit_type.miner_3.u_mem)
      console.log(newby)
    }
    else if (max_build_energy >= unit_type.miner_2.u_cost) {
      console.log('Spawning lvl2 Miner')
      newby = utils.get_spawn().createCreep(
            unit_type.miner_2.u_body,
            undefined,
            unit_type.miner_2.u_mem)
    }
    else if (max_build_energy >= unit_type.miner_1.u_cost) {
      console.log('Spawning lvl1 Miner')
      newby = utils.get_spawn().createCreep(
            unit_type.miner_1.u_body,
            undefined,
            unit_type.miner_1.u_mem)
    }
  }

  if (population_fighters.length < needed_fighters) {
      // We have a deficit of fighters, lets spawn some more!
    newby = utils.get_spawn().createCreep(
        unit_type.defender_1.u_body,
        undefined,
        unit_type.defender_1.u_mem)
  }

  //Lets try to ID these things that don't have unit_type definitions
  if (population_unknown.length > 0) {
    for (var i in population_unknown) {
      var creep = population_unknown[i]
      var body_style = creep.body.map(function(val) {
        return val.type
      })
      for (var creep_type in unit_type) {
        if (utils.equals(body_style, unit_type[creep_type].u_body)) {
          console.log('Identified a creep!')
          creep.memory= unit_type[creep_type].u_mem
        }
      }
    }
  }

  var most_important_workers = _.filter(
    Game.creeps, (creep) => creep.memory.role == Memory.socialStructure[0]
      || creep.memory.role == Memory.socialStructure[1])
  if (most_important_workers.length >=
    Memory.population[Memory.socialStructure[0]]
    + Memory.population[Memory.socialStructure[1]]
    && _.filter(Game.creeps,
      (creep) => creep.memory.role == 'upgrade').length < 1) {
    var worst_creep = _.min(
        most_important_workers,
        function(worker) {
          return worker.memory.lvl
        })
    var worst_level = Number(worst_creep.memory.lvl)
    var max_level = 3
    var next_level = worst_level + 1 > max_level ?
        max_level : worst_level + 1
      // console.log(worst_level, next_level, max_level)
    if (max_build_energy > unit_type['worker_'+next_level].u_cost) {
      if (worst_creep.memory.lvl < next_level) {
        console.log(worst_creep.name, 'is due for an upgrade!')
        worst_creep.memory.role = 'upgrade'
      }
    }
  }
}

function workersUnion() {

  // Create a correctly padded list of roles to provide to creeps
  var creeps_assignments = []
  for (var unit_role in Memory.socialStructure.workers) {
    for (let count = 0;
         count < Memory.population[Memory.socialStructure.workers[unit_role]];
         count ++) {
      creeps_assignments.push(Memory.socialStructure.workers[unit_role])
    }
  }

    // Create an ordered list of creeps (hashes are not numbered)
  var creeps_list = _.filter(
      Game.creeps, (creep) => (
        creep.memory.unit_type == 'worker'
        && creep.memory.role != 'regenerate'
        && creep.memory.role != 'upgrade'
      )
    )
  creeps_list = _.sortBy(
    creeps_list,
    [
      function(creep) {
        return creep.memory.lvl
      }
    ]
    )

  for (var count in creeps_assignments) {
    try {
      if (creeps_list.length > 0) {
        var creep = Game.creeps[creeps_list.shift().name]
        creep.memory.role = creeps_assignments[count]
      } else {
        break
      }
    } catch (err) {
      console.log(err)
    }
  }
  if (creeps_assignments.length- 1 - count != 0) {
    console.log('We have a ', creeps_assignments.length- 1 - count,
          'worker deficit!')
  }

  if (creeps_list.length > 0) {
    console.log('We have a worker Surplus!')
    for (let count = 0; count < creeps_list.length; count ++) {
      creep = Game.creeps[creeps_list.shift().name]
      console.log(creep.name, 'is heading for retirement!')
      creep.memory['role'] = 'recycle'
    }
  }
}

function minersUnion(room) {
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
}

function carriersUnion(room) {
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

module.exports = manager
