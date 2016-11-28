var priority = [
  'harvester',
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
  hauler: require('creep.role.hauler'),
  extractor: require('creep.role.extractor'),
  upgrader: require('creep.role.upgrader'),
  builder: require('creep.role.builder'),

    // Fighter roles
  defender: require('creep.role.defender'),

    // Misc
  regenerate: require('creep.role.regenerate'),
  recycle: require('creep.role.recycle'),
  upgrade: require('creep.role.recycle')
}

module.exports = roles
