var worker_priority = [
  'builder',
  'upgrader',
  'harvester'
]
var carrier_priority = [
  'hauler',
  'distributor'
]

if (!Memory.socialStructure) {
  Memory['socialStructure'] = {
    workers: worker_priority,
    carriers: carrier_priority
  }
}

if (!Memory.population) {
  Memory['population'] = {
    extractor: 2,
    builder: 1,
    defender: 0,
    distributor: 0,
    harvester: 0,
    hauler: 2,
    upgrader: 0,
  }
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
