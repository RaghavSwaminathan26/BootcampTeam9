import VisitedRestaurants from "../VisitedRestaurants";
import { AccountGate } from "@/components/AccountProvider";

export default function VisitedPage() {
  return (
    <AccountGate>
      <VisitedRestaurants />
    </AccountGate>
  );
}
