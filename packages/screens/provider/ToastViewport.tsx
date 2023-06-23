import { ToastViewport as ToastViewportOg } from "@lightdotso/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ToastViewport = () => {
  const { top, right, left } = useSafeAreaInsets();
  return <ToastViewportOg top={top + 5} left={left} right={right} />;
};
