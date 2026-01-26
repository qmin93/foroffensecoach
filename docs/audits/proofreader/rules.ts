import { Play } from "./types";

export function hasPuller(play: Play, position: string) {
  return play.assignments.some(
    a => a.position === position && a.action.toLowerCase().includes("pull")
  );
}

export function hasDiagramPull(play: Play, position: string) {
  return play.diagram.pulls?.includes(position);
}

export function normalizeName(play: Play, newName: string) {
  return { ...play, name: newName };
}
