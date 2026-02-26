import { createHashRouter } from "react-router";
import { TokenExplorer } from "./components/token-explorer";
import { WizardLayout } from "./components/wizard/wizard-layout";

export const router = createHashRouter([
  {
    path: "/",
    Component: TokenExplorer,
  },
  {
    path: "/wizard",
    Component: WizardLayout,
  },
]);
