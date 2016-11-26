var utils = require('utils')

if (!Memory.population) {
    Memory.population = {
        hauler: 0,
    }
} else if (!Memory.population.hauler) {
    Memory.population.hauler = 0
}

function hauler(creep) {
    if(creep.memory.state && creep.carry.energy == 0) {
        creep.memory.state = false;
    }
    if(!creep.memory.state && creep.carry.energy == creep.carryCapacity) {
        creep.memory.state = true;
    }

    if (!creep.memory.state) {
        var target = get_full_extractor(creep)
        if (target) {
            console.log(JSON.stringify(target))
            if (target.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                moveTo(target)
            }
        } else {

        }
    }

    if (creep.memory.state){
        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
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
                creep.moveTo(Game.flags.Chillout)
            }
        }

    }
}

function get_storage(creep) {
    // Returns any storag/container units in the room
    return storage_unit = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_STORAGE ||
                structure.structureType == STRUCTURE_CONTAINER) &&
                structure.store[RESOURCE_ENERGY] > 0
        }
    })

}

function get_full_extractor(creep) {
    var source = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: (extractor) => {
            extractor.memory.role == 'harvester' &&
            extractor.carry[RESOURCE_ENERGY] > 0
        }
    });
    var fullest = _.max(source)
    if (fullest == '-Infinity') {
        return
    } else {
        console.log('Returning Fullest creep!')
        return fullest
    }
}

module.exports = hauler;
