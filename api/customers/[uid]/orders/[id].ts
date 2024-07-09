import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  const { id, uid } = req.params;
  return res.status(200).json({ id, uid });
}
