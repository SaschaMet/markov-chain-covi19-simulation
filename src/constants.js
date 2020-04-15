const VENUE = "venue"
const AGENT = "agent"
const STAY = "stay"
const BASE = "base"

const SUSPECTIBLE = 0
const SICK = 1
const RECOVERED = 2
const DEAD = 3
const SPREADER = 4

const COLORS = ["#ECA6E1","#C28CBE","#9B729C","#76597B","#55415B","#362A3C"]
const FPS = 300

const TICKLENGTH = 1500

const Move = 0.9

const INITIAL_SIMULATION_STATE = {
	tick: 0,
	agentsPerHouse: 8,
	houses: 60,
	busStations: 3,
	hospitals: 1,
	supermarkets: 3,
	school: 1,
	office: 4,
	initialSickAgents: 1
}

export {
	INITIAL_SIMULATION_STATE,
	SUSPECTIBLE,
	SICK,
	SPREADER,
	RECOVERED,
	DEAD,
	VENUE,
	AGENT,
	COLORS,
	FPS,
	STAY,
	BASE,
	Move,
	TICKLENGTH
}
