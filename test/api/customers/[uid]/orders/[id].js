export default function handler(req, res) {
  const { id, uid } = req.params;
  return res.status(200).json({ id, uid });
}
