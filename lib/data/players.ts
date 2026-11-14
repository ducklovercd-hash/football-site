import type { Player, Position } from "@/lib/types";

/**
 * Curated sample of the squad data we already own.
 *
 * `scripts/prepare-data.mjs` converts the full 92,671-row
 * player_profiles.csv into data/players.json in exactly this shape, so
 * swapping this file for the real dataset is a one-line import change.
 */
type Row = [
  name: string,
  club: string,
  competition: string,
  position: Position,
  nationality: string,
  age: number,
  height: number,
  foot: "Left" | "Right" | "Both",
  appearances: number,
  minutes: number,
  goals: number,
  assists: number,
  rating: number,
];

const ROWS: Row[] = [
  ["Bukayo Saka", "Arsenal", "PL", "FW", "England", 23, 178, "Left", 21, 1780, 12, 9, 7.62],
  ["Martin Ødegaard", "Arsenal", "PL", "MF", "Norway", 26, 178, "Left", 19, 1610, 6, 8, 7.41],
  ["Declan Rice", "Arsenal", "PL", "MF", "England", 26, 185, "Right", 22, 1920, 3, 7, 7.28],
  ["William Saliba", "Arsenal", "PL", "DF", "France", 24, 192, "Right", 22, 1980, 1, 1, 7.19],
  ["Cole Palmer", "Chelsea", "PL", "MF", "England", 23, 189, "Left", 21, 1795, 14, 8, 7.71],
  ["Enzo Fernández", "Chelsea", "PL", "MF", "Argentina", 24, 178, "Right", 20, 1650, 4, 5, 7.12],
  ["Mohamed Salah", "Liverpool", "PL", "FW", "Egypt", 33, 175, "Left", 22, 1900, 18, 12, 7.94],
  ["Virgil van Dijk", "Liverpool", "PL", "DF", "Netherlands", 34, 193, "Right", 22, 1980, 3, 1, 7.55],
  ["Ryan Gravenberch", "Liverpool", "PL", "MF", "Netherlands", 23, 190, "Right", 21, 1740, 2, 4, 7.31],
  ["Erling Haaland", "Manchester City", "PL", "FW", "Norway", 25, 195, "Left", 21, 1820, 21, 4, 7.88],
  ["Rodri", "Manchester City", "PL", "MF", "Spain", 29, 191, "Right", 15, 1290, 2, 3, 7.46],
  ["Josko Gvardiol", "Manchester City", "PL", "DF", "Croatia", 23, 185, "Left", 20, 1740, 2, 2, 7.22],
  ["Bruno Fernandes", "Manchester United", "PL", "MF", "Portugal", 31, 179, "Right", 22, 1940, 8, 10, 7.35],
  ["Kobbie Mainoo", "Manchester United", "PL", "MF", "England", 20, 175, "Right", 18, 1320, 2, 2, 6.98],
  ["Son Heung-min", "Tottenham Hotspur", "PL", "FW", "South Korea", 33, 183, "Both", 20, 1620, 9, 6, 7.24],
  ["James Maddison", "Tottenham Hotspur", "PL", "MF", "England", 29, 175, "Right", 17, 1290, 5, 7, 7.09],
  ["Alexander Isak", "Newcastle United", "PL", "FW", "Sweden", 26, 192, "Right", 19, 1510, 13, 3, 7.48],
  ["Anthony Gordon", "Newcastle United", "PL", "FW", "England", 24, 182, "Right", 21, 1700, 8, 8, 7.16],
  ["Ollie Watkins", "Aston Villa", "PL", "FW", "England", 29, 180, "Right", 22, 1810, 11, 5, 7.27],
  ["Morgan Rogers", "Aston Villa", "PL", "MF", "England", 23, 187, "Right", 20, 1540, 6, 7, 7.14],

  ["Lautaro Martínez", "Inter", "SA", "FW", "Argentina", 28, 174, "Right", 21, 1720, 15, 6, 7.66],
  ["Nicolò Barella", "Inter", "SA", "MF", "Italy", 28, 175, "Right", 22, 1840, 4, 8, 7.38],
  ["Alessandro Bastoni", "Inter", "SA", "DF", "Italy", 26, 190, "Left", 21, 1860, 1, 4, 7.21],
  ["Rafael Leão", "AC Milan", "SA", "FW", "Portugal", 26, 188, "Right", 20, 1610, 9, 7, 7.33],
  ["Christian Pulisic", "AC Milan", "SA", "FW", "USA", 27, 177, "Right", 22, 1780, 11, 9, 7.42],
  ["Kenan Yıldız", "Juventus", "SA", "FW", "Türkiye", 20, 185, "Left", 21, 1640, 7, 6, 7.11],
  ["Manuel Locatelli", "Juventus", "SA", "MF", "Italy", 27, 185, "Right", 22, 1880, 2, 5, 7.05],
  ["Khvicha Kvaratskhelia", "Napoli", "SA", "FW", "Georgia", 24, 183, "Right", 19, 1560, 8, 10, 7.51],
  ["Scott McTominay", "Napoli", "SA", "MF", "Scotland", 29, 193, "Right", 21, 1730, 7, 4, 7.26],
  ["Paulo Dybala", "Roma", "SA", "FW", "Argentina", 32, 177, "Left", 17, 1220, 6, 5, 7.18],
  ["Matteo Guendouzi", "Lazio", "SA", "MF", "France", 26, 185, "Right", 20, 1660, 3, 5, 7.02],
  ["Ademola Lookman", "Atalanta", "SA", "FW", "Nigeria", 28, 174, "Right", 20, 1580, 12, 6, 7.44],
  ["Moise Kean", "Fiorentina", "SA", "FW", "Italy", 25, 183, "Right", 21, 1700, 13, 3, 7.29],

  ["Kylian Mbappé", "Real Madrid", "PD", "FW", "France", 27, 178, "Right", 22, 1880, 24, 7, 8.02],
  ["Jude Bellingham", "Real Madrid", "PD", "MF", "England", 22, 186, "Right", 20, 1720, 9, 8, 7.73],
  ["Vinícius Júnior", "Real Madrid", "PD", "FW", "Brazil", 25, 176, "Right", 21, 1790, 16, 11, 7.86],
  ["Lamine Yamal", "Barcelona", "PD", "FW", "Spain", 18, 180, "Left", 21, 1740, 10, 14, 7.69],
  ["Pedri", "Barcelona", "PD", "MF", "Spain", 23, 174, "Right", 22, 1890, 5, 9, 7.47],
  ["Robert Lewandowski", "Barcelona", "PD", "FW", "Poland", 37, 185, "Right", 19, 1340, 15, 3, 7.51],
  ["Pau Cubarsí", "Barcelona", "PD", "DF", "Spain", 18, 184, "Right", 20, 1760, 1, 1, 7.15],
  ["Julián Álvarez", "Atlético Madrid", "PD", "FW", "Argentina", 25, 170, "Right", 22, 1800, 14, 6, 7.58],
  ["Antoine Griezmann", "Atlético Madrid", "PD", "FW", "France", 34, 176, "Left", 20, 1520, 8, 9, 7.31],
  ["Dodi Lukébakio", "Sevilla", "PD", "FW", "Belgium", 28, 187, "Right", 19, 1480, 7, 5, 7.09],
  ["Takefusa Kubo", "Real Sociedad", "PD", "FW", "Japan", 24, 173, "Left", 21, 1700, 6, 8, 7.17],
  ["Álex Baena", "Villarreal", "PD", "MF", "Spain", 24, 175, "Left", 20, 1620, 5, 9, 7.24],

  ["Harry Kane", "Bayern München", "BL1", "FW", "England", 32, 188, "Right", 21, 1850, 26, 9, 8.11],
  ["Jamal Musiala", "Bayern München", "BL1", "MF", "Germany", 22, 184, "Right", 19, 1560, 11, 8, 7.64],
  ["Michael Olise", "Bayern München", "BL1", "FW", "France", 24, 183, "Left", 21, 1720, 10, 12, 7.59],
  ["Joshua Kimmich", "Bayern München", "BL1", "MF", "Germany", 30, 177, "Right", 22, 1900, 3, 10, 7.52],
  ["Serhou Guirassy", "Borussia Dortmund", "BL1", "FW", "Guinea", 29, 187, "Right", 20, 1640, 16, 4, 7.46],
  ["Karim Adeyemi", "Borussia Dortmund", "BL1", "FW", "Germany", 23, 180, "Left", 19, 1320, 7, 5, 7.08],
  ["Florian Wirtz", "Bayer Leverkusen", "BL1", "MF", "Germany", 22, 177, "Right", 21, 1780, 12, 13, 7.78],
  ["Granit Xhaka", "Bayer Leverkusen", "BL1", "MF", "Switzerland", 33, 185, "Left", 22, 1950, 2, 6, 7.23],
  ["Xavi Simons", "RB Leipzig", "BL1", "MF", "Netherlands", 22, 179, "Right", 20, 1680, 8, 9, 7.32],
  ["Hugo Larsson", "Eintracht Frankfurt", "BL1", "MF", "Sweden", 21, 187, "Right", 21, 1740, 4, 4, 7.04],
  ["Deniz Undav", "VfB Stuttgart", "BL1", "FW", "Germany", 29, 179, "Right", 19, 1460, 11, 5, 7.19],

  ["Ousmane Dembélé", "Paris Saint-Germain", "FL1", "FW", "France", 28, 178, "Both", 20, 1620, 17, 8, 7.81],
  ["Vitinha", "Paris Saint-Germain", "FL1", "MF", "Portugal", 25, 172, "Right", 22, 1900, 6, 9, 7.54],
  ["Achraf Hakimi", "Paris Saint-Germain", "FL1", "DF", "Morocco", 27, 181, "Right", 21, 1860, 4, 7, 7.37],
  ["Mason Greenwood", "Marseille", "FL1", "FW", "England", 24, 181, "Left", 21, 1720, 15, 5, 7.48],
  ["Adrien Rabiot", "Marseille", "FL1", "MF", "France", 30, 188, "Left", 20, 1700, 5, 4, 7.21],
  ["Folarin Balogun", "Monaco", "FL1", "FW", "USA", 24, 178, "Right", 19, 1380, 9, 3, 7.06],
  ["Maghnes Akliouche", "Monaco", "FL1", "MF", "France", 23, 180, "Left", 21, 1660, 6, 7, 7.27],
  ["Rayan Cherki", "Lyon", "FL1", "MF", "France", 22, 181, "Left", 20, 1520, 7, 10, 7.34],
  ["Jonathan David", "Lille", "FL1", "FW", "Canada", 26, 180, "Right", 22, 1830, 14, 4, 7.41],
];

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const PLAYERS: Player[] = ROWS.map((row, index) => {
  const [
    name,
    club,
    competition,
    position,
    nationality,
    age,
    height,
    foot,
    appearances,
    minutes,
    goals,
    assists,
    rating,
  ] = row;

  return {
    id: index + 1,
    name,
    slug: slugify(name),
    club,
    competition,
    position,
    nationality,
    age,
    height,
    foot,
    appearances,
    minutes,
    goals,
    assists,
    rating,
    contractExpires: `${2026 + (index % 4)}-06-30`,
  };
});

export function getPlayerBySlug(slug: string): Player | undefined {
  return PLAYERS.find((player) => player.slug === slug);
}

export function getTopScorers(limit = 10): Player[] {
  return [...PLAYERS].sort((a, b) => b.goals - a.goals).slice(0, limit);
}

export function getTopRated(limit = 10): Player[] {
  return [...PLAYERS].sort((a, b) => b.rating - a.rating).slice(0, limit);
}
