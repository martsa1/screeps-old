var priority = [
  'distributor',
  'hauler',
  'builder',
  'upgrader',
  'defender',
  'harvester'
]

if (!Memory.socialStructure) {
  Memory['socialStructure']['workers'] = priority
} else if (!Memory.socialStructure.workers){
  Memory.socialStructure['workers'] = priority
}

if (!Memory.population) {
  Memory['population'] = {
    extractor: 2,
    builder: 2,
    defender: 0,
    distributor: 2,
    harvester: 0,
    hauler: 0,
    upgrader: 2,
  }
} else if (!Memory.population.harvester) {
  Memory.population['harvester'] = 2
}


var roles = {

  // Worker roles
  harvester: require('creep.role.harvester'),
  extractor: require('creep.role.extractor'),
  upgrader: require('creep.role.upgrader'),
  builder: require('creep.role.builder'),

  // Carrier Roles
  hauler: require('creep.role.hauler'),
  distributor: require('creep.role.distributor'),

  // Fighter roles
  defender: require('creep.role.defender'),

  // Misc
  regenerate: require('creep.role.regenerate'),
  recycle: require('creep.role.recycle'),
  upgrade: require('creep.role.recycle')
}

module.exports = roles
