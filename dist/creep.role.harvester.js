var utils = require('utils')

if (!Memory.population) {
    Memory['population'] = {
        harvester: 6,
    }
} else if (!Memory.population.harvester) {
    Memory.population['harvester'] = 6
}

function harvester(creep) {
    // creep.say(creep.memory.transferring === true ? 'Transferring' : 'Harvesting')
     if(creep.memory.state && creep.carry.energy == 0) {
        creep.memory.state = false;
    }
    if(!creep.memory.state && creep.carry.energy == creep.carryCapacity) {
        creep.memory.state = true;
    }

    if(creep.memory.state) {

        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity * 0.9;
                }
        });
        if(target) {
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        else {
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                }
            });
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else {
                var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE ||
                                structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
                    }
                });
                if(target) {
                    if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else {
                    utils.go_relax(creep)
                }
            }
        }
    }
    else {
        if (!creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)) {
            var free_energy = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY)
            if (free_energy!= null && free_energy.resourceType == 'energy') {
                if(creep.pickup(free_energy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(free_energy);
                }
            }
            else {

                utils.harvest_nearest_energy(creep)
            }
        }
        else {
            utils.harvest_nearest_energy(creep)
        }
    }
}


module.exports = harvester;
