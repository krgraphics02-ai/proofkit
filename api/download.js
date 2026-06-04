export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "No URL" });
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(Buffer.from(buffer));
}