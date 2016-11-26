var roleHarvester = require('role.harvester')
var roleUpgrader = require('role.upgrader')
var roleBuilder = require('role.builder')
var roleDefender = require('role.defender')

var unit_roles = require('creep.roles')

var unit_type = require('creep.types')


// Default population split
var numBuilders = 5
var numHarvesters = 2
var numUpgraders = 2

var numDefenders = 0

if (!Memory.population){
    Memory.population = {
        harvesters: numHarvesters,
        builders: numBuilders,
        upgraders: numUpgraders,
        defenders: numDefenders
    }
}

var manager = {
    manage: function() {

        // Clean up our dead.
        undertaker()

        roleDefender.spawn(numDefenders)
        roleHarvester.spawn(numHarvesters)
        roleBuilder.spawn(numBuilders)
        roleUpgrader.spawn(numUpgraders)

        for(var name in Game.creeps) {
            // Run our creeps behaviour
            var creep = Game.creeps[name]
            unit_roles[creep.memory.role](creep)
        }
    }
}

function undertaker() {
    for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name]
                console.log('Today we mourn the passing of', name)
            }
        }
}

function spawn_units() {
    var needed_workers = Memory.population.builders + Memory.population.harvesters + Memory.population.upgraders
    var needed_fighters = Memory.population.Defenders

    var population_workers = _.filter(Game.creeps, (creep) => creep.memory.unit_type == 'worker')
    var population_fighters = _.filter(Game.creeps, (creep) => creep.memory.unit_type == 'defender')

    var population_dawdlers = _.filter(Game.creeps, (creep) => !creep.memory.role)
    var population_unknowns = _.filter(Game.creeps, (creep) => !cree.memory.unit_type)

    if (population_workers.length < needed_workers) {
        // We have a deficit of workers, lets spawn some more!
        spawn_point = get_spawn()
        var newby = spawn_point.createCreep(unit_type.worker_1)
    }

    if (population_fighters.length < needed_fighters) {
        // We have a deficit of fighters, lets spawn some more!
        spawn_point = get_spawn()
        var newby = spawn_point.createCreep(unit_type.fighter_1)
    }

    if (population_dawdlers) {
        // We've found idle units!  Either new spawns, or those with amnesia
        for (var unit in Memory.population) {
            // For each type of unit in our census
            unit_population = _.filter(Game.creeps, (creep) => creep.memory.role == unit)
            if (unit_population.length < Memory.population[unit]) {
                population_dawdlers[0].memory.role = unit
            }
        }
    }

    if (population_unknown) {
        // We found units without a defined type, lets try to ID them...
        for (var creep in population_unknowns) {
            console.log('Creep', creep.name, 'body:', creep.body.toString())
        }

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder')


    // if(population.length < numDefenders && numDefenders > 0) {
    //     var newName = get_spawn().createCreep([TOUGH, RANGED_ATTACK, RANGED_ATTACK,MOVE,MOVE], undefined, {role: 'defender'})
    //     // var newName = Game.spawns['base'].createCreep([RANGED_ATTACK,MOVE], undefined, {role: 'defender'})
    //     console.log('Spawning new defender: ' + newName)
    // }
    // if(population.length > numDefenders) {
    //     console.log('Too many Defenders: ' + population.length)
    //     population[0].suicide()
    // }
}

function get_spawn() {
    for (var i in Game.spawns) {
        return Game.spawns[i]
    }
}


module.exports = manager
