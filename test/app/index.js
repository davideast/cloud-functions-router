
import path from 'path'; // Import the path module
import { fileURLToPath } from 'url'; // Import for resolving module URLs

export default function handler(req, res) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename); 
  const filePath = path.join(__dirname, './index.html'); // Absolute path

  res.sendFile(filePath, (error) => {
    if (error) {
      console.error('Error sending file:', error);
      res.status(error.status || 500).send('Internal Server Error');
    }
  });
}
