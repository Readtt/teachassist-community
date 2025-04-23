import { z } from "zod";

export const leaderboardModes = z.enum(["class", "school", "global", "teams"])