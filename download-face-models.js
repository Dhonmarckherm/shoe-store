const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const MODELS_DIR = path.join(__dirname, '..', 'web', 'public', 'models');

const models = [
  // Tiny Face Detector
  'tiny_face_detector_model-shard1',
  'tiny_face_detector_model-weights_manifest.json',
  // Face Landmark 68
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  // Face Recognition
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  // Face Expression
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
];

function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(MODELS_DIR, filename);
    
    // Skip if already exists
    if (fs.existsSync(filePath)) {
      console.log(`✓ Already exists: ${filename}`);
      return resolve();
    }

    const url = `${MODEL_URL}/${filename}`;
    const file = fs.createWriteStream(filePath);

    console.log(`Downloading: ${filename}...`);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        console.error(`✗ Failed to download ${filename}: ${response.statusCode}`);
        return reject(new Error(`Failed to download ${filename}`));
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error(`✗ Error downloading ${filename}: ${err.message}`);
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Starting face-api.js model download...\n');
  
  // Ensure models directory exists
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
    console.log('Created models directory\n');
  }

  try {
    for (const model of models) {
      await downloadFile(model);
    }
    console.log('\n✅ All models downloaded successfully!');
  } catch (error) {
    console.error('\n❌ Download failed:', error.message);
    process.exit(1);
  }
}

downloadAll();
