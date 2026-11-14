import type { Competition, Team } from "@/lib/types";

export const COMPETITIONS: Competition[] = [
  { code: "PL", name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "SA", name: "Serie A", country: "Italy", flag: "🇮🇹" },
  { code: "PD", name: "La Liga", country: "Spain", flag: "🇪🇸" },
  { code: "BL1", name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  { code: "FL1", name: "Ligue 1", country: "France", flag: "🇫🇷" },
];

export const COMPETITION_BY_CODE: Record<string, Competition> = Object.fromEntries(
  COMPETITIONS.map((c) => [c.code, c]),
);

export const TEAMS: Team[] = [
  // Premier League
  { id: 1, name: "Arsenal", short: "ARS", color: "#EF0107" },
  { id: 2, name: "Chelsea", short: "CHE", color: "#034694" },
  { id: 3, name: "Liverpool", short: "LIV", color: "#C8102E" },
  { id: 4, name: "Manchester City", short: "MCI", color: "#6CABDD" },
  { id: 5, name: "Manchester United", short: "MUN", color: "#DA291C" },
  { id: 6, name: "Tottenham Hotspur", short: "TOT", color: "#132257" },
  { id: 7, name: "Newcastle United", short: "NEW", color: "#241F20" },
  { id: 8, name: "Aston Villa", short: "AVL", color: "#95BFE5" },

  // Serie A
  { id: 11, name: "Inter", short: "INT", color: "#0068A8" },
  { id: 12, name: "AC Milan", short: "MIL", color: "#FB090B" },
  { id: 13, name: "Juventus", short: "JUV", color: "#1A1A1A" },
  { id: 14, name: "Napoli", short: "NAP", color: "#12A0D7" },
  { id: 15, name: "Roma", short: "ROM", color: "#8E1F2F" },
  { id: 16, name: "Lazio", short: "LAZ", color: "#87D8F7" },
  { id: 17, name: "Atalanta", short: "ATA", color: "#1E71B8" },
  { id: 18, name: "Fiorentina", short: "FIO", color: "#592C82" },

  // La Liga
  { id: 21, name: "Real Madrid", short: "RMA", color: "#FEBE10" },
  { id: 22, name: "Barcelona", short: "BAR", color: "#A50044" },
  { id: 23, name: "Atlético Madrid", short: "ATM", color: "#CB3524" },
  { id: 24, name: "Sevilla", short: "SEV", color: "#D81920" },
  { id: 25, name: "Real Sociedad", short: "RSO", color: "#0067B1" },
  { id: 26, name: "Villarreal", short: "VIL", color: "#FFE667" },
  { id: 27, name: "Real Betis", short: "BET", color: "#00954C" },
  { id: 28, name: "Valencia", short: "VAL", color: "#F18E00" },

  // Bundesliga
  { id: 31, name: "Bayern München", short: "FCB", color: "#DC052D" },
  { id: 32, name: "Borussia Dortmund", short: "BVB", color: "#FDE100" },
  { id: 33, name: "Bayer Leverkusen", short: "B04", color: "#E32221" },
  { id: 34, name: "RB Leipzig", short: "RBL", color: "#DD0741" },
  { id: 35, name: "Eintracht Frankfurt", short: "SGE", color: "#E1000F" },
  { id: 36, name: "VfB Stuttgart", short: "VFB", color: "#E32219" },
  { id: 37, name: "VfL Wolfsburg", short: "WOB", color: "#65B32E" },
  { id: 38, name: "SC Freiburg", short: "SCF", color: "#1A1A1A" },

  // Ligue 1
  { id: 41, name: "Paris Saint-Germain", short: "PSG", color: "#004170" },
  { id: 42, name: "Marseille", short: "OM", color: "#2FAEE0" },
  { id: 43, name: "Monaco", short: "ASM", color: "#E63312" },
  { id: 44, name: "Lyon", short: "OL", color: "#DA001A" },
  { id: 45, name: "Lille", short: "LOSC", color: "#E01E13" },
  { id: 46, name: "Nice", short: "NIC", color: "#C8102E" },
  { id: 47, name: "Rennes", short: "REN", color: "#E13327" },
  { id: 48, name: "Lens", short: "RCL", color: "#FFE500" },
];

export const TEAM_BY_ID: Record<number, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t]),
);

export const TEAMS_BY_COMPETITION: Record<string, Team[]> = {
  PL: TEAMS.filter((t) => t.id >= 1 && t.id <= 8),
  SA: TEAMS.filter((t) => t.id >= 11 && t.id <= 18),
  PD: TEAMS.filter((t) => t.id >= 21 && t.id <= 28),
  BL1: TEAMS.filter((t) => t.id >= 31 && t.id <= 38),
  FL1: TEAMS.filter((t) => t.id >= 41 && t.id <= 48),
};

export const VENUES: Record<number, string> = {
  1: "Emirates Stadium",
  2: "Stamford Bridge",
  3: "Anfield",
  4: "Etihad Stadium",
  5: "Old Trafford",
  6: "Tottenham Hotspur Stadium",
  7: "St James' Park",
  8: "Villa Park",
  11: "San Siro",
  12: "San Siro",
  13: "Allianz Stadium",
  14: "Stadio Diego Armando Maradona",
  15: "Stadio Olimpico",
  16: "Stadio Olimpico",
  17: "Gewiss Stadium",
  18: "Stadio Artemio Franchi",
  21: "Santiago Bernabéu",
  22: "Spotify Camp Nou",
  23: "Riyadh Air Metropolitano",
  24: "Ramón Sánchez-Pizjuán",
  25: "Reale Arena",
  26: "Estadio de la Cerámica",
  27: "Benito Villamarín",
  28: "Mestalla",
  31: "Allianz Arena",
  32: "Signal Iduna Park",
  33: "BayArena",
  34: "Red Bull Arena",
  35: "Deutsche Bank Park",
  36: "MHPArena",
  37: "Volkswagen Arena",
  38: "Europa-Park Stadion",
  41: "Parc des Princes",
  42: "Orange Vélodrome",
  43: "Stade Louis II",
  44: "Groupama Stadium",
  45: "Stade Pierre-Mauroy",
  46: "Allianz Riviera",
  47: "Roazhon Park",
  48: "Stade Bollaert-Delelis",
};
