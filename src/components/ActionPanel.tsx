import { useRun } from "../store/useRun";
import NodeChoicePanel from "./NodeChoicePanel";
import BattlePanel from "./BattlePanel";
import ShopPanel from "./ShopPanel";
import ResolvePanel from "./ResolvePanel";

export default function ActionPanel() {
  const status = useRun((s) => s.status);
  switch (status) {
    case "choosing": return <NodeChoicePanel />;
    case "battle": return <BattlePanel />;
    case "shop": return <ShopPanel />;
    case "resolving": return <ResolvePanel />;
    case "rel":
    case "prologue":
    case "storySelect":
    case "storyOpening":
    case "interlude":
    case "finalChoice":
    case "levelup":
    case "ended":
      return null;
  }
}
