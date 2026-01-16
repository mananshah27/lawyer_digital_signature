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
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "Verification token is required",
      });
    }

    const result = await authService.verifyEmail(token);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Email verification failed",
    });
  }
}
