var tower = {
    run: function(tower) {
        if(tower) {
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile)
            } else {
                var closestDamagedCreep = tower.pos.findClosestByRange(FIND_CREEPS, {
                    filter: (creep) => creep.hits < creep.hitsMax
                });
                if(closestDamagedCreep) {
                    tower.repair(closestDamagedCreep)
                } else {
                    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax * 0.95 &&
                        structure.structureType != STRUCTURE_WALL &&
                        structure.structureType != STRUCTURE_RAMPART
                    })
                    if(closestDamagedStructure) {
                        tower.repair(closestDamagedStructure)
                    } else {
                        var closestDamagedWall = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => structure.hits <= Memory.defense.wall_health &&
                            (structure.structureType == STRUCTURE_WALL ||
                            structure.structureType == STRUCTURE_RAMPART)
                        })
                        if(closestDamagedWall) {
                            tower.repair(closestDamagedWall)
                        }
                    }
                }
            }
        }
    },

    manage: function() {
        for(var name in Game.structures) {
            if (Game.structures[name].structureType == STRUCTURE_TOWER) {
                var tower = Game.structures[name]
                this.run(tower)
            }
        }
    }
}

module.exports = tower
