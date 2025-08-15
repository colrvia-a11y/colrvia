import Card from "../Card";
import { clsx } from "clsx";
import { ReactNode } from "react";
export { Card };
export default Card;
export function CardContent({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={clsx(className)}>{children}</div>;
}
