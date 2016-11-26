var unit_types = {

    worker_1:  {
            u_body: [WORK, CARRY, MOVE, MOVE],
            u_name: undefined,
            u_mem: {'unit_type': 'worker', 'lvl': '1'},
            u_cost: 100+50+(50*2)
    },

    worker_2: {
            u_body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
            u_name: undefined,
            u_mem:{'unit_type': 'worker', 'lvl': '2'},
            u_cost: (100*2)+(50*2)+(50*4)
    },

    worker_3: {
            u_body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
            u_name: undefined,
            u_mem:{'unit_type': 'worker', 'lvl': '3'},
            u_cost: (100*3)+(50*3)+(50*6)
    },

    defender_1: {
            u_body: [TOUGH, RANGED_ATTACK, RANGED_ATTACK,MOVE,MOVE],
            u_name: undefined,
            u_mem:{'unit_type': 'defender', 'lvl': '1'}
    }
}

module.exports = unit_types
