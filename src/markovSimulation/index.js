import utilFunctions from "../utils"

import {
	DEAD,
	SICK,
	AGENT,
	SUSPECTIBLE,
	RECOVERED,
	STAY,
	BASE,
	Move
} from "../constants"

import applyFixedNodeGrid from "../components/Grid/index"

const { randomSample, distance, weightedRandom, randomChoice } = utilFunctions

const VENUES = [
	{
		name: "house",
		isRoot: true,
		count: simulationState => simulationState.houses,
		members: simulationState => simulationState.agentsPerHouse,
	},
	{
		name: "school",
		count: simulationState => simulationState.school,
	},
	{
		name: "hospital",
		count: simulationState => simulationState.hospitals,
	},
	{
		name: "supermarket",
		count: simulationState => simulationState.supermarkets,
	},
	{
		name: "station",
		count: simulationState => simulationState.busStations,
	},
	{
		name: "office",
		count: simulationState => simulationState.office,
	},
]

// Possibility for transitioning from one state to another
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
}

// Possibility for a suspectible person to get sick when in contact with a sick person
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
}

// Possible transitions between venues
const transitionMap = {
	"supermarket": ["base", "base", "station"],
	"school": ["school", "base", "base", "station"],
	"hospital": ["hospital", "base", "base", "station"],
	"office": ["office", "base", "base", "station"],
	"station": ["base", "office", "school", "hospital", "supermarket"],
	"house": ["supermarket", "station", "hospital", "school", "office", "house"],
}

// Selects the next venue for an agent
const getNextMarkovStateForAgent = (agent) => {
	const [agentLocation] = agent.location.split("-")

	if (agentLocation === "house" && Math.random() < Move)
		return STAY

	const map = transitionMap[agentLocation]
	return randomChoice(map)
}

// applies to SIR-Model to each agent in a node
const applySIRModel = (nodes, edges) => {
	for (const node of nodes) {
		if (node.type !== "agent") {
			continue
		}

		// get the location of the agent
		const location = nodes.find(({ id }) => node.location === id)

		// get all the current agents at that location
		edges
			.filter(({ target }) => target.id === location.id)
			.map(({ source }) => source)
			.forEach(
				(agent) => {
					if (agent.id === node.id)
						return

					// if there is a sick agent at the node,
					// convert all suspectible agents with a certain probability to the sick status
					if (node.state === SICK) {
						agent.state = weightedRandom(DISEASE_SPREAD_TRANSITION[agent.state])
					}

					// randomly select the next state for a sick person (recovered or dead)
					agent.state = weightedRandom(SIR_TRANSITION_STATE[agent.state])
				}
			)
	}
}

// moves the agents from one venue to another
const moveAgent = (nodes, edges, agent, targetNode) => {
	const sourceNode = nodes.find(({ id }) => id === agent.location)

	if (targetNode.locked || sourceNode.locked) {
		return
	}

	edges.forEach(edge => {
		if (edge.source.id === agent.id) {
			edge.target = targetNode
		}
	})

	agent.location = targetNode.id
}

// helper function to find the closest node (e.g. the closest hospital)
const findClosestNode =(source, targets) => {
	try {
		return targets.reduce(
			(prev, current) => distance(source, current) < distance(source, prev) ? current : prev
		)
	} catch (error) {
		return source
	}
}

// creates the initial graph
const getInitialGraph = (simulationState) => {
	const nodes = []
	const edges = []

	// iterate through each venue
	VENUES.forEach(({name, members, count}) => {
		for (let i = 0, nodeIndex = 0; i < count(simulationState); i++, nodeIndex++) {
			const venueId = `${name}-${i}`
			nodes.push({
				type: "venue",
				venue: name,
				id: venueId,
				size: 1,
			})

			// if the venue has no member continue (a supermarket has no members, only a house does)
			if (!members) continue

			// add agents to houses
			for (var j = 0; j < members(simulationState); j++, nodeIndex++) {
				const agentId = `${name}-${i}-${j}`
				nodes.push({
					type: "agent",
					location: venueId,
					base: venueId,
					id: agentId,
					size: 1,
					state: SUSPECTIBLE,
				})
				edges.push({
					"source": agentId,
					"target": venueId,
				})
			}
		}
	})

	// add the sick agents
	const sickAgents = randomSample(
		nodes.filter(({ type }) => type === "agent"),
		simulationState.initialSickAgents
	)
	for (const agent of sickAgents) {
		agent.state = SICK
	}

	return ({
		nodes: applyFixedNodeGrid(nodes),
		edges,
	})
}


// function for the markov simulation
const nextSimulationTick = (state, nodes, edges) => {
	// iterate through all the agents
	nodes
		.filter(
			({ type }) => type === AGENT
		)
		.forEach(
			(agent) => {
				// get the next location for the agents
				const nextMarkovState = getNextMarkovStateForAgent(agent)
				const [agentLocation] = agent.location.split("-")
				if (
					agentLocation === nextMarkovState ||
					(nextMarkovState === BASE && agent.location === agent.base) ||
					nextMarkovState === STAY
				) {
					return
				} else if (agent.state === DEAD) {
					return // skip dead agents
				} else if (nextMarkovState === BASE) {
					// move the agent back to his home
					moveAgent(
						nodes,
						edges,
						agent,
						nodes.find(({ id }) => id === agent.base)
					)
				} else {
					// move the agent to the next closest node (e.g. hospital)
					moveAgent(
						nodes,
						edges,
						agent,
						findClosestNode(agent, nodes.filter(({ venue }) => venue === nextMarkovState))
					)
				}

			}
		)

	// apply the SIR model
	nodes = applySIRModel(nodes, edges)

	return {
		nodes: nodes,
		edges: edges,
		state: { ...state, tick: state.tick + 1},
	}
}

export {
	getInitialGraph,
	nextSimulationTick,
}
