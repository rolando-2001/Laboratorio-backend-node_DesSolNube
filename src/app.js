require('dotenv').config({ path: '../.env' });
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));



const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const miRegion = "us-east-1";
let s3 = new S3Client({
  region: miRegion,
  credentials: {
    accessKeyId: process.env.LLAVEACCESO,
    secretAccessKey: process.env.LLAVESECRETO,
  },
});

app.post("/subida", upload.single("file"), async (req, res) => {
  console.log(req.file);
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: "No se encontró ningún archivo. Verifica el nombre del campo en Postman." });
    }

    let bucket = "lab12-rolando";
    let carpetaInternaBucket = "imagenes/miavatar.jpg";
    let urlImagen = `https://${bucket}.s3.${miRegion}.amazonaws.com/${carpetaInternaBucket}`;

    const redimensionBuffer = await sharp(req.file.buffer)
      .resize({ width: 600, height: 600, fit: "cover" })
      .toBuffer();

    const params = {
      Bucket: bucket,
      Key: carpetaInternaBucket,
      Body: redimensionBuffer,
      ContentType: "image/jpeg",
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    res.status(200).json({ urlImagen: urlImagen, mensaje: "Archivo subido correctamente" });
  } catch (error) {
    console.error("Error al procesar la subida:", error);
    res.status(500).json({ mensaje: "Hubo un error al subir la imagen, intenta nuevamente" });
  }
});


app.get('/data', (req, res) => {
  res.json({ message: "data" });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(process.env.LLAVEACCESO);
  console.log(`Server running on port ${PORT}`);
});
