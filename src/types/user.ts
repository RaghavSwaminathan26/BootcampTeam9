import { RestaurantInput } from "@/types/restaurant";

type User = {
  username: string;
  password: string;
  restaurants: RestaurantInput[];
};

export default User;
