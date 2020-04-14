import {
  SUSPECTIBLE,
  SICK,
  RECOVERED,
  DEAD
} from '../constants';

import utilFunctions from '../utils';

export const STAY = 'stay';
export const BASE = 'base';

const { randomChoice, weightedRandom } = utilFunctions

const move = () => 0.9

const SIR_TRANSITION_STATE = {
  [SUSPECTIBLE]: [
    [1, SUSPECTIBLE],
  ],
  [RECOVERED]: [
    [1, RECOVERED],
  ],
  [SICK]: [
    [0.995, SICK],
    [0.0049, RECOVERED],
    [0.0001, DEAD],
  ],
  [DEAD]: [
    [1, DEAD],
  ],
};

const DISEASE_SPREAD_TRANSITION = {
  [SUSPECTIBLE]: [
    [0.15, SICK],
    [0.85, SUSPECTIBLE],
  ],
  [RECOVERED]: [
    [1, RECOVERED],
  ],
  [SICK]: [
    [1, SICK],
  ],
  [DEAD]: [
    [1, DEAD],
  ],
};

const transitionMap = {
  'house': ['supermarket', 'station', 'hospital', 'house', 'house', 'house',
            'house', 'house', 'house', 'house', 'house'],
  'supermarket': ['base', 'base', 'base', 'supermarket'],
  'hospital': ['hospital', 'base', 'base', 'base'],
  'station': ['supermarket', 'base', 'base', 'base', 'temple'],
  'school': ['supermarket', 'base', 'base', 'base'],
  'office': ['supermarket', 'base', 'base', 'base'],
};

const getNextMarkovStateForAgent = (agent) => {
  const [agentLocation] = agent.location.split('-');

  if (agentLocation === 'house' && Math.random() < move()) {
    return STAY;
  }

  const map = transitionMap[agentLocation];

  return randomChoice(map);
}

const applySIRModel = (nodes, edges) => {
  for (const node of nodes) {
    if (node.type !== 'agent') {
      continue;
    }

    const location = nodes.find(({ id }) => node.location === id);

    const agents = edges
      .filter(({ target }) => target.id === location.id)
      .map(({ source }) => source);

    agents.forEach(
      (agent) => {
        if (agent.id === node.id) {
          return;
        }

        //
        if (node.state === SICK) {
          agent.state = weightedRandom(DISEASE_SPREAD_TRANSITION[agent.state]);
        }

        agent.state = weightedRandom(SIR_TRANSITION_STATE[agent.state]);
      }
    )
  }
}

export { getNextMarkovStateForAgent, applySIRModel }