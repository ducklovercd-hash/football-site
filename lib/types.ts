export type MatchStatus = "SCHEDULED" | "LIVE" | "HT" | "FT";

export type FormResult = "W" | "D" | "L";

export interface Team {
  id: number;
  name: string;
  short: string;
  color: string;
}

export interface Competition {
  code: string;
  name: string;
  country: string;
  flag: string;
}

export interface TeamStats {
  possession: number;
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  xg: [number, number];
  passAccuracy: [number, number];
}

export type EventType = "GOAL" | "PEN" | "YELLOW" | "RED" | "SUB";

export interface MatchEvent {
  minute: number;
  type: EventType;
  side: "home" | "away";
  player: string;
  detail?: string;
}

export type Position = "GK" | "DF" | "MF" | "FW";

export interface LineupPlayer {
  number: number;
  name: string;
  position: Position;
  /** Match rating out of 10, derived from performance (see buildMatch). */
  rating: number;
  nationality: string;
  /** Headshot URL when the data source provides one; absent for demo data. */
  photoUrl?: string;
}

export interface TeamLineup {
  /** e.g. "4-3-3", drives the formation pitch grid. */
  formation: string;
  players: LineupPlayer[];
}

export interface Match {
  id: string;
  competition: Competition;
  home: Team;
  away: Team;
  status: MatchStatus;
  kickoff: string;
  minute: number | null;
  score: { home: number | null; away: number | null };
  halfTime: { home: number; away: number } | null;
  venue: string;
  stats: TeamStats;
  events: MatchEvent[];
  lineups: { home: TeamLineup; away: TeamLineup };
  form: { home: FormResult[]; away: FormResult[] };
  /** Model inputs, attack/defence multipliers around 1.0 */
  strength: {
    home: { attack: number; defence: number };
    away: { attack: number; defence: number };
  };
}

export interface StandingRow {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: FormResult[];
}


export interface Player {
  id: number;
  name: string;
  slug: string;
  club: string;
  competition: string;
  position: Position;
  nationality: string;
  age: number;
  height: number;
  foot: "Left" | "Right" | "Both";
  appearances: number;
  minutes: number;
  goals: number;
  assists: number;
  rating: number;
  contractExpires: string;
  /** Headshot URL when the data source provides one; absent in the sample set. */
  photoUrl?: string;
}

export interface Prediction {
  homeWin: number;
  draw: number;
  awayWin: number;
  lambdaHome: number;
  lambdaAway: number;
  over25: number;
  btts: number;
  topScorelines: { home: number; away: number; probability: number }[];
}
