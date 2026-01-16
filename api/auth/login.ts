import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authService } from "../../server/services/auth";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return res.status(401).json({
      error: error.message || "Invalid credentials",
    });
  }
}
