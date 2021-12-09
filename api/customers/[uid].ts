import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  const { uid } = req.params;
  return res.status(200).json({ uid });
}
