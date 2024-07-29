export default function handler(req, res) {
  const { uid } = req.params;
  return res.status(200).json({ uid });
}
