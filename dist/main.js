var creepManager = require('creep.manager')
var towerManager = require('towerManager')
var roomManager = require('room.manager')

Room.prototype.creepManager = creepManager.manage
Room.prototype.towerManager = towerManager.manage

Room.prototype.jobsList = roomManager.createJobsList
Room.prototype.workDispatch = roomManager.workDispatch

module.exports.loop = function () {

    // Manage creeps & Towers room by room
  for (var room in Game.rooms) {
    var current_room = Game.rooms[room]
    current_room.jobsList()
    current_room.workDispatch()
    current_room.creepManager(current_room)
    current_room.towerManager(current_room)
  }
}
