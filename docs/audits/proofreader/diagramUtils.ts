import { Play } from "./types";

export function diagramHasAction(
  play: Play,
  position: string
): boolean {
  return (
    play.diagram.pulls?.includes(position) ||
    play.diagram.routes?.includes(position) ||
    play.diagram.blocks?.includes(position)
  );
}
