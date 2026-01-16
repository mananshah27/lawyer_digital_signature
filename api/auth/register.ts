import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authService } from "../../server/services/auth";
import { insertUserSchema } from "../../shared/schema";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userData = insertUserSchema.parse(req.body);
    const user = await authService.register(userData);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message || "Registration failed",
    });
  }
}
