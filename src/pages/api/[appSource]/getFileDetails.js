import { apiAllowCors, prisma } from "services";
import path from "path";

/**
 * Handler de Requisição da Rota.
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 */
const handler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await getFileDetails(req, res);
      break;
    default:
      res.status(405).send({ message: "Only GET requests allowed" });
      break;
  }
};

export default apiAllowCors(handler);


/**
 * Recebe a requisição do arquivo a ser baixado, acessa o BD para trazer
 * o arquivo com suas referências e retorna as propriedades do arquivo solicitado.
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response 
 * @param {*} fileId ID do arquivo a ser enviado
 * @param {*} referenceObjId ID de referência do objeto a ser enviado
 * @param {*} appSource nome da aplicação de origem da transferência de arquivo
 * @returns {*} Detalhamento das informações do arquivo
 */
export const getFileDetails = async (req, res) => {
  try {
    const { fileId, referenceObjId } = req.query;

    // RETORNA ERRO NA AUSÊNCIA DE PARÂMETROS
    if (!fileId && !referenceObjId)
      return res.status(400).json({
        status: 400,
        message: "fileId or referenceObjId is required!",
      });

    // CONSULTA DADOS DE REFERÊNCIA DO ARQUIVO
    const fileDetails = await prisma.files.findFirst({
      where: {
        id: fileId,
        referenceObjId: referenceObjId,
      },
    });

    // RETORNA ERRO CASO O ARQUIVO NÃO SEJA ENCONTRADO NO BD
    if (!fileDetails)
      return res.status(400).json({ status: 400, message: "file not found!" });

    return res.status(200).json({ fileDetails });
  } catch (e) {
    console.log(e);
    return res.status(500).json(e.message);
  }
};
