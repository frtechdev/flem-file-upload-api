import multer from "multer";
import fs from "fs";
import { DateTime } from "luxon";
import { prisma } from "services";
import path from "path";

/**
 * Função básica de Upload.
 * Recebe o arquivo, define as propriedades e o armazena em local temporário.
 * @param {*} appSource nome da aplicação de origem da transferência de arquivo
 * @param {*} referenceObjId ID do objeto de referência (padrão: "temp")
 * @param {*} req Requisição HTTP de origem da transferência de arquivo
 * @returns {Function} Função de Callback
 */
const upload = multer({
  storage: multer.diskStorage({
    //DEFINE DESTINO DO ARQUIVO
    destination: async (req, file, cb) => {
      const { appSource, referenceObjId = "temp" } = req.query;
      //LOCAL DE ARMAZENAMENTO DO ARQUIVO
      const dest = `${process.env.NEXT_PUBLIC_API_FILESERVER_STORAGE_UPLOAD}/${appSource}/${DateTime.now()
        .setLocale("pt-BR")
        .toFormat("yyyy/MM/dd")}/${referenceObjId}`;
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      req.dest = dest;
      // req.referenceObjId = referenceObjId;
      // req.fileCatalogList = [];

      return cb(null, dest);
    },
    // DEFINE NOME DO ARQUIVO
    filename: async (req, file, cb) => {
      const id = DateTime.now().toFormat("HHmmss");
      //const { appSource, referenceObjId = "temp" } = req.query;

      return cb(null, `${id}_${file.originalname}`);
    },
  }),

  //VERIFICA SE O ARQUIVO JÁ EXISTE PELO ÍNDICE DO BD E RETORNA ERRO EM CASO POSITIVO
  fileFilter: async (req, file, cb) => {
    file.originalname = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    const checkFileExists = await prisma.files.findFirst({
      where: {
        name: file.originalname,
      },
    });

    if (checkFileExists !== null) {
      return cb(null, false);
    }

    return cb(null, true);
  },
});

export {upload};
