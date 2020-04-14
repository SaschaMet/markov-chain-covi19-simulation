import utilFunctions from "../utils"

import {
  DEAD,
  SICK,
  AGENT,
  SUSPECTIBLE,
} from '../constants';

import applyFixedNodeGrid from './grid';
import { getNextMarkovStateForAgent, STAY, BASE, applySIRModel } from './markov';

const { randomSample, distance } = utilFunctions

const VENUES = [
  {
    name: 'house',
    isRoot: true,
    count: simulationState => simulationState.houses,
    members: simulationState => simulationState.agentsPerHouse,
  },
  {
    name: 'school',
    count: simulationState => simulationState.schools,
  },
  {
    name: 'hospital',
    count: simulationState => simulationState.hospitals,
  },
  {
    name: 'supermarket',
    count: simulationState => simulationState.supermarkets,
  },
  {
    name: 'station',
    count: simulationState => simulationState.busStations,
  },
  {
    name: 'office',
    count: simulationState => simulationState.schools,
  },
];

const getInitialGraph = (simulationState) => {
	const nodes = [];
	const edges = [];

	VENUES.forEach(({
		name,
		members,
		isRoot,
		count,
		alignment,
	}) => {
		for (let i = 0, nodeIndex = 0; i < count(simulationState); i++, nodeIndex++) {
			const venueId = `${name}-${i}`;
			nodes.push({
				type: 'venue',
				venue: name,
				id: venueId,
				size: 1,
			});

			if (!members) {
				continue;
			}

			for (var j = 0; j < members(simulationState); j++, nodeIndex++) {
				const agentId = `${name}-${i}-${j}`;
				nodes.push({
				type: 'agent',
				location: venueId,
				base: venueId,
				id: agentId,
				size: 1,
				state: SUSPECTIBLE,
				});
				edges.push({
					'source': agentId,
					'target': venueId,
				});
			}
		}
	});

	const sickAgents = randomSample(
		nodes.filter(({ type }) => type === 'agent'),
		simulationState.initialSickAgents
	);

	for (const agent of sickAgents) {
		agent.state = SICK;
	}

	const schools = nodes.filter(node => node.venue === "school")
	const office = nodes.filter(node => node.venue === "office")
	const market = nodes.filter(node => node.venue === "supermarket")

	console.log({ schools, office, market })

	return ({
		nodes: applyFixedNodeGrid(nodes),
		edges,
	});
}

const nextSimulationTick = (state, nodes, edges) => {
  nodes
    .filter(
      ({ type }) => type === AGENT
    )
    .forEach(
      (agent, i) => {
        const nextMarkovState = getNextMarkovStateForAgent(agent);
        const [agentLocation] = agent.location.split('-')

        if (
          agentLocation === nextMarkovState ||
          (nextMarkovState === BASE && agent.location === agent.base) ||
          nextMarkovState === STAY
        ) {
          return;
        } else if (agent.state === DEAD) {
          return;
        } else if (nextMarkovState === BASE) {
          moveAgent(
            nodes,
            edges,
            agent,
            nodes.find(({ id }) => id === agent.base)
          );
        } else {
          moveAgent(
            nodes,
            edges,
            agent,
            findClosestNode(agent, nodes.filter(({ venue }) => venue === nextMarkovState))
          );
        };

      }
    );

  nodes = applySIRModel(nodes, edges);

  return {
    nodes: nodes,
    edges: edges,
    state: { ...state, tick: state.tick + 1},
  }
}

const moveAgent = (nodes, edges, agent, targetNode) => {
  const sourceNode = nodes.find(({ id }) => id === agent.location);

  if (targetNode.locked || sourceNode.locked) {
    return;
  }

  edges.forEach(edge => {
    if (edge.source.id === agent.id) {
      edge.target = targetNode;
    }
  });

  agent.location = targetNode.id;
}

const findClosestNode =(source, targets) => {
  try {
  return targets.reduce(
        (prev, current) => distance(source, current) < distance(source, prev) ? current : prev
      );
  } catch (error) {
    return source
  }
}

export {
  VENUES,
  getInitialGraph,
  nextSimulationTick,
};
