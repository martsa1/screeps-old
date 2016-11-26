var creepManager = require('creep.manager')
var towerManager = require('towerManager')


module.exports.loop = function () {

    // Manage creeps room by room
    for (var room in Game.rooms) {
        var current_room = Game.rooms[room]
        creepManager.manage(current_room)
    }

    // Run creeps globally
    creepManager.run()

    // Towers don't need to be run by room though...
    towerManager.manage()
}
