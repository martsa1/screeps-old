function extractor(creep) {
  // if (!creep.memory.allocation) {
    // // Do something here to get a sourceAllocation
    // creep.memory['allocation'] = ''
    // console.log('Finding a Source to work with')
    // allocateSourceID(creep, room)
  if (creep.memory.allocation) {
    // console.log('Attempting to harvest from new source');
    harvest_source_by_ID(creep)
  }
  else {
    console.log('I was unable to find a source!')
    delete creep.memory.role
  }
  // }
  // else {
  //   harvest_source_by_ID(creep)
  // }
}

function harvest_source_by_ID(creep) {
  var source = Game.getObjectById(creep.memory.allocation);
  if (!source) {
    console.log('I seem to have forgotten my destination as it doesn\'t seem '
      + 'to make sense anymore')
    delete creep.memory.allocation
  }
  if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
    creep.moveTo(source)
  }
}

// function allocateSourceID(creep, room) {
//   console.log('Finding a source');
//   var extractors = room.find(FIND_MY_CREEPS, (extractor) => (
//     extractor.memory.role == 'extractor'
//   ))
//   creep.memory.sourceAllocation = room.find(FIND_SOURCES)
//     .map(({ id }) => id)
//     .reduce((former, next) => {
//       var alreadyAllocated = false
//       for (let name in extractors) {
//         let creep = extractors[name]
//         if (creep.memory.sourceAllocation &&
//           creep.memory.sourceAllocation === former) {
//           alreadyAllocated = true
//           break
//         }
//       }
//       if (!alreadyAllocated) {
//         return former
//       }
//       else {
//         return former = next
//       }
//     })
//   console.log(creep.name, 'found a source:', creep.memory.sourceAllocation);
// }

module.exports = extractor
