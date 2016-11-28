var priority = [
  'harvester',
  'distributor',
  'hauler',
  'builder',
  'upgrader',
  'defender',
  'extractor'
]

if (!Memory.socialStructure) {
  Memory['socialStructure'] = priority
} else {
  Memory.socialStructure = priority
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
