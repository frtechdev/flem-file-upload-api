import { apiAllowCors, prisma } from "services";
import fs from "fs";
import getFileDetails from "./getFileDetails";

/**
 * Handler de Requisição da Rota.
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 */
const handler = async (req, res) => {
  switch (req.method) {
    case "PATCH":
      await indexFile(req, res);
      break;

    default:
      res.status(405).send({ message: "Only PATCH requests allowed" });
      break;
  }
};

export default apiAllowCors(handler);


/**
 * Realiza a indexação do arquivo.
 * Ao realizar um upload, o arquivo possui um Objeto de Referência padrão ou nulo.
 * Esse método atualiza no BD as informações de referenceObjId com o referenceObjId gerado
 * ao realizar o upload, cria um diretório dentro do servidor de armazenamento com o nome apropriado,
 * e atualiza essas informações no BD.
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response 
 * @param {*} fileId ID do arquivo a ser enviado
 * @param {*} referenceObjId ID de referência do objeto a ser enviado
 * @returns {*} Detalhes do arquivo com as informações atualizadas
 */
const indexFile = async (req, res) => {
  try {
    const { fileId } = req.query;
    const { referenceObj } = req.body;

    // // RETORNA ERRO NA AUSÊNCIA DE PARÂMETROS
    // if (!fileId && !referenceObjId)
    //   return res.status(400).json({
    //     status: 400,
    //     message: "fileId or referenceObjId is required!",
    //   });

    // // CONSULTA DADOS DE REFERÊNCIA DO ARQUIVO
    // const getFileDetails = await prisma.files.findFirst({
    //   where: {
    //     id: fileId,
    //   },
    // });

    // if (!getFileDetails)
    //   return res.status(400).json({ status: 400, message: "file not found!" });

    const fileDetails = getFileDetails(req, res);

    const oldPath = fileDetails.path;

    const destPath = fileDetails.path
      .replace(fileDetails.referenceObjId, referenceObj.id)
      .replace(fileDetails.name, "");

    const newPath = fileDetails.path.replace(
      fileDetails.referenceObjId,
      referenceObj.id
    );

    if (!fs.existsSync(destPath)) {
      await fs.promises.mkdir(destPath, { recursive: true });
    }

    const moveFile = await fs.promises.rename(oldPath, newPath);

    const updateFileDetails = await prisma.files.update({
      data: {
        referenceObjId: referenceObj.id,
        path: newPath,
      },
      where: {
        id: fileId,
      },
    });
    
    return res.status(200).json(updateFileDetails);
  } catch (e) {
    console.log(e);
    return res.status(500).json(e.message);
  }
};
