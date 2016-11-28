var tower = {
  run: function(tower, room) {
    if(tower) {
      var closestHostile = tower.pos.findClosestByRange(
        FIND_HOSTILE_CREEPS
      )
      if(closestHostile) {
        tower.attack(closestHostile)
      }
      else {
        var closestDamagedCreep = tower.pos.findClosestByRange(
          FIND_CREEPS, {
            filter: (creep) => creep.hits < creep.hitsMax
          }
        )
        if(closestDamagedCreep) {
          tower.heal(closestDamagedCreep)
        }
        else {
          var closestDamagedStructure = tower.pos.findClosestByRange(
            FIND_STRUCTURES,
            {
              filter: (structure) => (
                structure.hits < structure.hitsMax * 0.95 &&
                structure.structureType != STRUCTURE_WALL &&
                structure.structureType != STRUCTURE_RAMPART
              )
            }
          )
          if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure)
          }
          else {
            var closestDamagedRampart = room.lookForAtArea(
              LOOK_STRUCTURES, 0, 0, 49, 49, true)
              .map(({ structure }) => structure)
              .filter(({ structureType }) =>
                structureType === STRUCTURE_RAMPART)
              .filter(({ hits }) => hits
                < Memory.defense.wall_health)
            if (closestDamagedRampart.length > 0) {
              var target = closestDamagedRampart.reduce((lowest, next) => {
                if (lowest.hits < next.hits) {
                  return lowest
                }
                else {
                  return next
                }
              })
            }
            if(target) {
              tower.repair(target)
            }
            else {
              var closestDamagedWall = room.lookForAtArea(
                LOOK_STRUCTURES, 0, 0, 49, 49, true)
                .map(({ structure }) => structure)
                .filter(({ structureType }) =>
                  structureType === STRUCTURE_WALL)
                .filter(({ hits }) => hits
                  < Memory.defense.wall_health)
              if (closestDamagedWall.length > 0) {
                target = closestDamagedWall.reduce((lowest, next) => {
                  if (lowest.hits < next.hits) {
                    return lowest
                  }
                  else {
                    return next
                  }
                })
              }
              if(target) {
                tower.repair(target)
              }
            }
          }
        }
      }
    }
  },

  manage: function(room) {
    for(var name in Game.structures) {
      if (Game.structures[name].structureType == STRUCTURE_TOWER) {
        var tower = Game.structures[name]
        this.run(tower, room)
      }
    }
  }
}

module.exports = tower
