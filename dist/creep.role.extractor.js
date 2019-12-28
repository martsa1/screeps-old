var utils = require('utils')

if (!Memory.population) {
  Memory.population = {
    extractor: 0,
  }
} else if (!Memory.population.extractor) {
  Memory.population.extractor = 0
}

function extractor(creep) {
    // creep.say(
    //   creep.memory.transferring === true ? 'Transferring' : 'Harvesting'
    // )
  utils.harvest_nearest_energy(creep)
}

module.exports = extractor
