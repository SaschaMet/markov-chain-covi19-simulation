import utilFunctions from "../../utils"

const { shuffle } = utilFunctions

const applyFixedNodeGrid = (nodes, height = 800) => {
	shuffle(nodes)

	const gridSize = 100
	const nodesToAlign = nodes.filter(({ type }) => type === "venue")
	const count = nodesToAlign.length

	for (var i = 0; i < count; i++) {
		const node = nodesToAlign[i]

		const row = Math.floor(i / (height / gridSize)) + 1
		const col = Math.floor(i % ((height) / gridSize)) + 1

		const fx = row * gridSize
		const fy = col * gridSize

		node.fx = fx
		node.fy = fy
	}

	return nodes
}

// eslint-disable-next-line no-irregular-whitespace
export default applyFixedNodeGrid