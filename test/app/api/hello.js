export default function handler(req, res) {
  if(!req.locals.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return res.status(200).json({ name: 'Plz work', uid: req.locals.user.uid });
}
