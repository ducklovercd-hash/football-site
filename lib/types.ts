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
  lineups: { home: LineupPlayer[]; away: LineupPlayer[] };
  form: { home: FormResult[]; away: FormResult[] };
  /** Model inputs — attack/defence multipliers around 1.0 */
  strength: {
    home: { attack: number; defence: number };
    away: { attack: number; defence: number };
  };
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
