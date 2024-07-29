export default function handler(req, res) {
  console.log({ locals: req.locals });
  return res.status(200).json({ name: 'Plz work' });
}
