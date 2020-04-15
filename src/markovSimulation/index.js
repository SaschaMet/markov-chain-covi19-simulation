/* eslint-disable no-irregular-whitespace */
/* eslint-disable array-callback-return */

import {
	DEAD,
	SICK,
	AGENT,
	SUSPECTIBLE,
	RECOVERED,
	SPREADER,
	STAY,
	BASE,
	Move,
} from "../constants"

import utilFunctions from "../utils"
import applyFixedNodeGrid from "../components/Grid/index"

const { randomSample, randomChoice, moveAgent, findClosestNode } = utilFunctions

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

// Selects the next venue for an agent
const getNextMarkovStateForAgent = (agent) => {
	const [agentLocation] = agent.location.split("-")

	if (agentLocation === "house" && Math.random() < Move)
		return STAY

	const map = transitionMap[agentLocation]
	return randomChoice(map)
}

// Possibility for transitioning from one state to another
// Must be ordered from least likely to most likely!
const SIR_TRANSITION_STATE = {
	[SUSPECTIBLE]: [
		[1, SUSPECTIBLE],
	],
	[SPREADER]: [
		[0.20, SICK], // chance of 20% to get symptoms
		[1, SPREADER],
	],
	[SICK]: [
		[0.01, DEAD], // 1% chance of dying when having the disease
		[0.1, RECOVERED], // chance of 10% to recover
		[1, SICK],
	],
	[RECOVERED]: [
		[1, RECOVERED],
	],
	[DEAD]: [
		[1, DEAD],
	],
}

// Possibility for a suspectible person to get sick when in contact with a sick person or a spreader
// Must be ordered from least likely to most likely!
const DISEASE_SPREAD_TRANSITION = {
	[SUSPECTIBLE]: [
		[0.1, SPREADER], // chance of 10% to catch the disease
		[1, SUSPECTIBLE],
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
	[SPREADER]: [
		[1, SPREADER]
	],
}

// Possible transitions between venues
const transitionMap = {
	"supermarket": ["base", "base", "station"],
	"school": ["school", "base", "base", "station"],
	"hospital": ["hospital", "base", "base", "station"],
	"office": ["office", "base", "base", "station"],
	"station": ["base", "office", "school", "hospital", "supermarket"],
	"house": ["supermarket", "station", "station", "hospital", "school", "office", "base", "base", "base"],
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
		agent.state = SPREADER
	}

	return ({
		nodes: applyFixedNodeGrid(nodes),
		edges,
	})
}

const applyModel = (agent, model) => {
	// get a random number
	const random = Number(Math.random().toFixed(3))
	const result = model[agent.state]
	for(const res of result) {
		const [probability, value] = res
		if(random <= probability)
			return value
	}
	return agent.state // fallback
}

const applySIRModel = (nodes, state) => {
	// holds all the nodes for the next state with the updated agent states
	const nextState = []

	// get all the locations where there a infected agents
	const sickLocations = nodes.reduce((acc, node) => {
		const { location, state } = node
		if(state !== SICK && state !== SPREADER)
			return acc

		if(!acc[location])
			acc[location] = 0

		acc[location] = acc[location] + 1
		return acc
	}, {})

	// iterate through each agent
	for(const agent of nodes) {
		if(agent.type === "venue")
			continue

		// spread the disease
		if(sickLocations[agent.location])
			agent.state = applyModel(agent, DISEASE_SPREAD_TRANSITION)

		agent.state = applyModel(agent, SIR_TRANSITION_STATE)

		// add a timestamp for the date the agent was infected
		if(agent.state === SPREADER) {
			agent.timeOfInfection = state.tick
		}

		nextState.push(agent)
	}

	return nextState
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
	nodes = applySIRModel(nodes, state)

	return {
		nodes,
		edges,
		state: { ...state, tick: state.tick + 1},
	}
}

export {
	getInitialGraph,
	nextSimulationTick,
}
