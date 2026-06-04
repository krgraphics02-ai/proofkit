import piexif from 'piexifjs';

export default async function handler(req, res) {
  try {
    const { url, timestamp } = req.query;
    if (!url) return res.status(400).json({ error: "No URL" });
    const response = await fetch(decodeURIComponent(url));
    if (!response.ok) return res.status(404).json({ error: "Not found" });
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const b64jpeg = "data:image/jpeg;base64," + base64;
    let result = b64jpeg;
    if (timestamp) {
      try {
        const dateObj = new Date(decodeURIComponent(timestamp));
        const pad = n => String(n).padStart(2, '0');
        const exifDate = `${dateObj.getFullYear()}:${pad(dateObj.getMonth()+1)}:${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
        const exifObj = { "0th": {}, "Exif": {} };
        exifObj["0th"][piexif.ImageIFD.DateTime] = exifDate;
        exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal] = exifDate;
        exifObj["Exif"][piexif.ExifIFD.DateTimeDigitized] = exifDate;
        const exifStr = piexif.dump(exifObj);
        result = piexif.insert(exifStr, b64jpeg);
      } catch(e) {}
    }
    const finalBuffer = Buffer.from(result.split(",")[1], 'base64');
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'attachment');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(finalBuffer);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
