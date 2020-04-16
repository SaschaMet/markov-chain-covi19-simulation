# Ziel: Simnulation einer Pandemie mittels Markov-Chain
Mittels einer Markov-Chain wird die Ausbreitung einer Krankheit innerhalb einer Population von 480 Personen simuliert.

## Den Personen stehen sechs Orte zur Verfügung:
1. Das eigene Zuhause (60) mit 8 Personen in einem Haus
2. Öffentliche Transportmittel (3)
3. Krankenhaus (1)
4. Schulen (1)
5. Büros (4)
6. Supermärkte (3)

## Folgende Annahmen gelten:
- CFR (case fatality rate) von ca. 2% [2% aller Infizierten sterben an der Krankheit]
- Bei Kontakt mit einem Infizierten besteht eine 10% Chance sich anzustecken
- Sobald ein Agent erkrankt ist, wird er zu einem "Spreader" (er kann andere Leute anstecken, zeigt aber noch keine Symptome)
- Mit einer 20% Wahrscheinlichkeit je Iteration zeigt ein Infizierter Symptome und wird zu einem Kranken
- Die Agents verlassen mir einer Wahrscheinlichkeit von 10% je Iteration ihr Haus und gehen zu einem der fünf anderen Orte
- Eine Iteration entspricht 1,5 Sekunden
- Je länger der Agent krank ist, desto höher ist seine Wahrscheinlichkeit, dass er an der Krankheit stirbt

## Folgende Parameter können angepasst werden:
- Die Anzahl der initialen Kranken
- Die Anzahl der einzelnen Gebäude

# Verbesserungen
Folgende Verbesserungen können vorgenommen werden um das Modell besser an die "reale" Welt anzupassen:

-[] Lock-Down Szenarien integrieren
	- [] Ausgangssperre und Bewegungsrate minimieren
	- [] Mundschutz einführen und Ansteckungsrate minimieren
	- [] Kompletter Lockdown (Agents verlassen nicht mehr ihr Haus)
-[] Krankheitsverlauf mit einberechnen (20% aller Fälle verlaufen schwer -> höhere Change daran zu sterben)
-[] Alter mit einbeziehen
-[] Vorerkrankungen mit einbeziehen
-[] Kapazität von Krankenhäusern mit einbeziehen

# Model

## Transitions
```javascript
// Possibility for transitioning from one state to another
const SIR_TRANSITION_STATE = {
	[SUSPECTIBLE]: [
		[1, SUSPECTIBLE],
	],
	[SPREADER]: [
		[0.20, SICK], // chance of 20% to get symptoms
		[1, SPREADER],
	],
	[SICK]: [
		[0.01, DEAD], // chance of dying when having the disease
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

// Possibility for a suspectible person to get infected when in contact with a sick person or a spreader
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

```

## Dynamische Kalkulation der Todesfälle
```javascript
// the longer the agents is sick, the higher the chance of dying
const calculateChanceOfDying = (agent) => {
	if(!agent.daysSinceInfection)
		return DEAD

	const probability = agent.daysSinceInfection / 10 // daysSinceInfection = time since infection in days
	const random = Number(Math.random().toFixed(2))

	if(random < probability)
		return SICK

	return DEAD

}
```

# Credits
Danke an @fatiherikli [<https://fatiherikli.github.io/coronavirus-simulation>] auf dessen Code dieses Repo aufgebaut ist.