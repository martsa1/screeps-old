var unit_roles = require('creep.roles')
var unit_type = require('creep.types')

var utils = require('utils')

var _ = require('lodash')

if (!Memory.defense) {
    Memory.defense = {
        wall_health: 5000
    }
}

var manager = {
    manage: function(current_room) {

        undertaker()
        spawn_units(current_room)
        workersUnion()
    },

    run: function() {
        for(var name in Game.creeps) {
            // Run our creeps behaviour
            var creep = Game.creeps[name]
            if (creep.memory.role) {
                try {
                    // console.log(creep.name, ', Role:', creep.memory.role)
                    unit_roles[creep.memory.role](creep)
                } catch (err) {
                    console.log(creep.name, 'caught amnesia, former role:',
                                creep.memory.role, ', unsetting role:', err)
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
                if (creep.ticksToLive < 100 &&
                    creep.memory.role != 'regenerate') {
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
        + Memory.population.upgrader
        + Memory.population.hauler
        + Memory.population.extractor || 0
    var needed_fighters = Memory.population.defender || 0

    var population_workers = _.filter(
      Game.creeps, (creep) => (
        creep.memory.unit_type == 'worker'
        && creep.memory.role != 'upgrade'
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

    if (population_workers.length < needed_workers) {
        // We have a deficit of workers, lets spawn some more!
        if (max_build_energy >= unit_type.worker_3.u_cost) {
            if (_.filter(
              Game.creeps, (creep) => (
                creep.memory.role == Memory.socialStructure[0]) <
                Memory.population[Memory.socialStructure[0]]
              )
            ) {
              // We shouldn't really get here, but in case all our units are
              // dead or something...
              console.log('Spawning lvl1 Worker')
              var newby = utils.get_spawn().createCreep(
                unit_type.worker_1.u_body,
                undefined,
                unit_type.worker_1.u_mem)
              return
            }
            console.log('Spawning lvl3 Worker')
            var newby = utils.get_spawn().createCreep(
              unit_type.worker_3.u_body,
              undefined,
              unit_type.worker_3.u_mem)
            console.log(newby)
        }
        else if (max_build_energy >= unit_type.worker_2.u_cost) {
            if (_.filter(
              Game.creeps, (creep) => (
                creep.memory.role == Memory.socialStructure[0]) <
                Memory.population[Memory.socialStructure[0]]
              )
            ) {
              // We shouldn't really get here, but in case all our units are
              // dead or something...
              console.log('Spawning lvl1 Worker')
              var newby = utils.get_spawn().createCreep(
                unit_type.worker_1.u_body,
                undefined,
                unit_type.worker_1.u_mem)
              return
            }
            console.log('Spawning lvl2 Worker')
            var newby = utils.get_spawn().createCreep(
              unit_type.worker_2.u_body,
              undefined,
              unit_type.worker_2.u_mem)
        }
        else if (max_build_energy >= unit_type.worker_1.u_cost) {
            console.log('Spawning lvl1 Worker')
            var newby = utils.get_spawn().createCreep(
              unit_type.worker_1.u_body,
              undefined,
              unit_type.worker_1.u_mem)
        }
    }

    if (population_fighters.length < needed_fighters) {
        // We have a deficit of fighters, lets spawn some more!
        var newby = utils.get_spawn().createCreep(
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

    var min_lvl_workers = _.filter(
      Game.creeps, (creep) => creep.memory.role == Memory.socialStructure[0])
    if (min_lvl_workers.length ==
      Memory.population[Memory.socialStructure[0]]) {
        var worst_creep = _.min(
          min_lvl_workers,
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
    for (var unit_role in Memory.socialStructure) {
        for (
          var count = 0;
          count < Memory.population[Memory.socialStructure[unit_role]];
          count ++) {
            creeps_assignments.push(Memory.socialStructure[unit_role])
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
        for (var i in creeps_list) {
                var creep = Game.creeps[creeps_list.shift().name]
                console.log(creep.name, 'is heading for retirement!')
                creep.memory['role'] = 'recycle'
            }
    }
}



module.exports = manager
