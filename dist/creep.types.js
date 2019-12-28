var unit_types = {

  worker_1:  {
    u_body: [
      WORK,
      CARRY,
      MOVE,
      MOVE
    ],
    u_mem: {'unit_type': 'worker', 'lvl': '1'},
    u_cost: 100+50+(50*2)
  },

  worker_2: {
    u_body: [
      WORK,
      WORK,
      CARRY,
      CARRY,
      MOVE,
      MOVE,
      MOVE,
      MOVE
    ],
    u_mem:{'unit_type': 'worker', 'lvl': '2'},
    u_cost: (100*2)+(50*2)+(50*4)
  },

  worker_3: {
    u_body: [
      WORK,
      WORK,
      WORK,
      CARRY,
      CARRY,
      CARRY,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE
    ],
    u_mem:{'unit_type': 'worker', 'lvl': '3'},
    u_cost: (100*3)+(50*3)+(50*6)
  },

  worker_4: {
    u_body: [
      WORK,
      WORK,
      WORK,
      WORK,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE
    ],
    u_mem:{'unit_type': 'worker', 'lvl': '4'},
    u_cost: (100*4)+(50*4)+(50*8)
  },

  carrier_1:  {
    u_body: [
      CARRY,
      CARRY,
      MOVE,
      MOVE
    ],
    u_mem: {'unit_type': 'carrier', 'lvl': '1'},
    u_cost: (50*2)+(50*2)
  },

  carrier_2: {
    u_body: [
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      MOVE,
      MOVE,
      MOVE,
      MOVE
    ],
    u_mem:{'unit_type': 'carrier', 'lvl': '2'},
    u_cost: (50*4)+(50*4)
  },

  carrier_3: {
    u_body: [
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE
    ],
    u_mem:{'unit_type': 'carrier', 'lvl': '3'},
    u_cost: (50*6)+(50*6)
  },

  carrier_4: {
    u_body: [
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE,
      MOVE
    ],
    u_mem:{'unit_type': 'carrier', 'lvl': '4'},
    u_cost: (50*8)+(50*8)
  },

  defender_1: {
    u_body: [
      TOUGH,
      RANGED_ATTACK,
      RANGED_ATTACK,
      MOVE,
      MOVE
    ],
    u_mem:{'unit_type': 'defender', 'lvl': '1'}
  },

  extractor_1: {
    u_body: [
      MOVE,
      WORK,
      WORK,
      WORK,
      WORK,
      WORK,
      WORK,
      WORK,
      WORK
    ],
    u_mem:{'unit_type': 'extractor', 'lvl': '1'},
    u_cost: 50+(100*8)
  }
}

module.exports = unit_types
