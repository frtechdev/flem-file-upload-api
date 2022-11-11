import { apiAllowCors, prisma } from "services";
import fs from "fs";

/**
 * Handler de Requisição da Rota.
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 */
const handler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await getFile(req, res);
      break;
    default:
      res.status(405).send({ message: "Only GET requests allowed" });
      break;
  }
};
export default apiAllowCors(handler);


/**
 * Recebe a requisição do arquivo a ser baixado, acessa o BD para trazer
 * o arquivo com suas referências e o retorna.
 * 
 * Exemplo: http://localhost:3000/api/Teste/downloadFile?fileId='2rdr454t365'&referenceObjId='3354f45'
 * 
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response 
 * @param {*} fileId ID do arquivo a ser enviado
 * @param {*} referenceObjId ID de referência do objeto a ser enviado
 * @returns {File} Arquivo solicitado
 */
const getFile = async (req, res) => {
  try {
    const { fileId, referenceObjId } = req.query;

    // RETORNA ERRO NA AUSÊNCIA DE PARÂMETROS
    if (!fileId && !referenceObjId)
      return res.status(400).json({
        status: 400,
        message: "fileId or referenceObjId is required!",
      });

      // REQUISIÇÃO AO BANCO DE DADOS
    const fileDetails = await prisma.files.findFirst({
      where: {
        id: fileId,
        referenceObjId: referenceObjId,
      },
    });

    // RETORNA MENSAGEM CASO ARQUIVO ESTEJA AUSENTE
    if (!fileDetails)
      return res.status(400).json({ status: 400, message: "file not found!" });

    // LÊ O ARQUIVO
    const file = await fs.promises.readFile(fileDetails.path);
    res.setHeader("filename", encodeURI(fileDetails.name));
    res.setHeader("file-content-type", fileDetails.contentType);

    return res.status(200).send(file);
  } catch (e) {
    console.log(e);
    return res.status(500).json(e.message);
  }
};

