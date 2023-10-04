import express, { Request, Response } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import * as minio from "minio";
import fs from "fs";

const app = express();
const PORT = 8080;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "temp");
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}__${file.originalname}`);
  },
});

const imageUpload = multer({ storage: storage });

const minioClient = new minio.Client({
  endPoint: "103.150.93.30",
  port: 9000,
  useSSL: false,
  accessKey: "!NaufanRikzaMinIO99",
  secretKey: "W£Bn1:26;0",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app
  .get("/", (req: Request, res: Response) => {
    res.send("this is muler server");
  })
  .post(
    "/events/cover-image",
    imageUpload.single("image"),
    async (req: Request, res: Response) => {
      try {
        console.log(req.file?.filename);

        const filename = req.file?.filename;
        const bucketName = "passify.io";
        const tempFile = `./temp/${filename}`;
        const fileData = fs.readFileSync(tempFile);
        const result = await minioClient.putObject(
          bucketName,
          filename!,
          fileData
        );

        const imgPath = `http://103.150.93.30:9000/${bucketName}/${filename}`;

        console.log(result);
        fs.unlinkSync(tempFile);

        res.status(200).json({
          status: 200,
          message: "image uploaded",
          error: null,
          data: {
            img_path: imgPath,
          },
        });
      } catch (e) {
        res.status(500).json({
          status: 500,
          message: "image fail",
          error: e,
        });
      }
    }
  );

app.listen(PORT, () => {
  console.log(`Multer server is running at ${PORT}`);
});
