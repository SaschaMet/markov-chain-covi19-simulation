const VENUE = 'venue';
const AGENT = 'agent';

const SUSPECTIBLE = 0;
const SICK = 1;
const RECOVERED = 2;
const DEAD = 3;

const COLORS = ['#ECA6E1','#C28CBE','#9B729C','#76597B','#55415B','#362A3C'];
const FPS = 1300;

const INITIAL_SIMULATION_STATE = {
  tick: 0,
  agentsPerHouse: 9,
  houses: 42,
  busStations: 1,
  hospitals: 1,
  supermarkets: 3,
  school: 1,
  office: 1,
  initialSickAgents: 1
};

export {
  INITIAL_SIMULATION_STATE,
  SUSPECTIBLE,
  SICK,
  RECOVERED,
  DEAD,
  VENUE,
  AGENT,
  COLORS,
  FPS,
};
