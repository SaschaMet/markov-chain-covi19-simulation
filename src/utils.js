import { COLORS as colors } from "./constants"
import { useEffect, useRef } from "react"

const useInterval = (callback, delay) => {
	// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
	const savedCallback = useRef()

	// Remember the latest callback.
	useEffect(() => {
		savedCallback.current = callback
	}, [callback])

	// Set up the interval.
	useEffect(() => {
		function tick() {
			savedCallback.current()
		}
		if (delay !== null) {
			let id = setInterval(tick, delay)
			return () => clearInterval(id)
		}
	}, [delay])
}

const getRandom = length => (Math.floor(Math.random() * length))

// https://stackoverflow.com/a/37835673
const randomSample = (array, size) => {
	var r, i = array.length, end = i - size, temp, swaps = randomSample.swaps

	while (i-- > end) {
		r = getRandom(i + 1)
		temp = array[r]
		array[r] = array[i]
		array[i] = temp
		swaps.push(i)
		swaps.push(r)
	}

	var sample = array.slice(end)

	while(size--) {
		i = swaps.pop()
		r = swaps.pop()
		temp = array[i]
		array[i] = array[r]
		array[r] = temp
	}

	return sample
}

randomSample.swaps = []

const randomChoice = array => {
	return array[Math.floor(Math.random() * array.length)]
}

const shuffle = array => {
	// https://stackoverflow.com/a/2450976
	var currentIndex = array.length, temporaryValue, randomIndex

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1

		// And swap it with the current element.
		temporaryValue = array[currentIndex]
		array[currentIndex] = array[randomIndex]
		array[randomIndex] = temporaryValue
	}

	return array
}

const rangeBetween = (min, max) => {
	return Math.random() * (max - min) + min
}

const shade = value => {
	let sum = 0

	for (var i in colors) {
		const color = colors[i]
		if (value <= sum) {
			return color
		}

		sum += 1 / colors.length
	}

	return colors[colors.length - 1]
}

const padding = (value, max, padded) => {
	return Math.min(Math.max(padded, value), max - 50)
}

const distance = (source, target) => {
	return Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2))
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

export default {
	padding,
	distance,
	shade,
	rangeBetween,
	randomChoice,
	shuffle,
	useInterval,
	randomSample,
	findClosestNode,
	moveAgent
}