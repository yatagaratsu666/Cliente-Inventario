import type { HeroType } from "./heroe.model";

export interface Hero {
  id: string;
  name: string;
  level: number;
  role: HeroType;
}

export interface MissionListItem {
  id: string;
  name: string;
  recommendedLevel: [number, number];
  difficulty: string;
  type: string;
  rewards: { xpBase: number };
  available: boolean;
  notAvailableReason?: string;
}

export interface MissionDetail {
  id: string;
  name: string;
  lore: string;
  boss: { name: string; role: HeroType };
  objectives: { id: string; description: string; targetCount: number }[];
  requirements: { minLevel?: number; items?: string[] };
  recommendedLevel: [number, number];
  durationSeconds: number;
  totalTurns: number;
  difficulty: string;
  type: string;
  rewards: { xpBase: number };
  masterInfo: { possible: boolean; probability: number; appearsAt: string; epicIfWin: string };
  restrictions: string[];
}

export interface EnrollmentResponse { execId: string; }

export interface ProgressResponse {
  status: string;
  progress: {
    turn: number;
    totalTurns: number;
    timeElapsed: number;
    timeTotal: number;
    percent: number;
    objectives: { id: string; description: string; targetCount: number; currentCount: number }[];
  };
  events: any[];
}

export interface ResultResponse {
  xpGained: number | undefined;
  status: string;
  result?: {
    success: boolean;
    xpGained: number;
    epicLearned?: string|null;
    drops: { type: string; name: string; chance: number }[];
    summary: string;
  };
  master?: any;
}
export function roleLabel(role: string): string {
  const map: Record<string,string> = {
    TANK: "Guerrero Tanque",
    WARRIOR_ARMS: "Guerrero Armas",
    MAGE_FIRE: "Mago Fuego",
    MAGE_ICE: "Mago Hielo",
    ROGUE_POISON: "Pícaro Veneno",
    ROGUE_MACHETE: "Pícaro Machete",
    SHAMAN: "Chamán",
    MEDIC: "Médico"
  };
  return map[role] || role;
}

export interface ResultResponse {
  status: string;
  result?: {
    success: boolean;
    xpGained: number;
    epicLearned?: string|null;
    drops: { type: string; name: string; chance: number }[];
    summary: string;
  };
  master?: any;
}
