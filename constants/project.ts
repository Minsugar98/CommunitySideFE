// src/constants/project.ts

export const POSITION_MAP: Record<string, string> = {
  Backend: "백엔드",
  Frontend: "프론트엔드",
  AI: "AI",
  Designer: "디자이너",
  App: "앱",
  PM: "PM",
  Planner: "기획자",
  Marketer: "마케터",
};

export const POSITION_KEYS = Object.keys(POSITION_MAP);

export const TECH_STACKS = [
  "Next.js", "NestJS", "Node.js", "React", "Vue", 
  "Python", "Java", "Spring", "TypeScript", "Docker"
];