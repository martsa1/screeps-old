var creepManager = require('creep.manager')
var towerManager = require('towerManager')

module.exports.loop = function () {

    // Manage creeps & Towers room by room
  for (var room in Game.rooms) {
    var current_room = Game.rooms[room]
    creepManager.manage(current_room)
    towerManager.manage(current_room)
  }

    // Run creeps globally
  creepManager.run()
}
