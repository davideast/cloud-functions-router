import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  const { id } = req.params;
  return res.status(200).json({ id });
}
