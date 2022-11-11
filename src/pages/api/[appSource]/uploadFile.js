import { upload } from "controllers/upload";
import { apiAllowCors, prisma, runMiddleware } from "services";

/**
 * Handler de Requisição da Rota.
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 */
const handler = async (req, res) => {
  switch (req.method) {
    case "POST":
      await uploadFile(req, res);
      break;
    default:
      res.status(405).send({ message: "Only POST requests allowed" });
      break;
  }
};

export default apiAllowCors(handler);

/**
 * Recebe o arquivo e faz o upload do mesmo, adicionando informações no BD e armazenando
 * o arquivo.
 * 
 * Exemplo: http://localhost:3000/api/Teste/uploadFile?referenceObjId='3354f45'
 * 
 * @param {*} req HTTP Request
 * @param {*} res HTTP Response
 * @param {*} appSource nome da aplicação de origem da transferência de arquivo
 * @param {*} referenceObjId ID de referência do objeto a ser enviado
 * @returns {File} Arquivo solicitado
 */
const uploadFile = async (req, res) => {
  try {
    const { appSource, referenceObjId = "temp" } = req.query;

    // REJEITA SE NÃO POSSUI O APPSOURCE COMO PARÂMETRO
    if (!appSource)
      return res
        .status(400)
        .json({ status: 400, message: "appSource is required!" });

    // MIDDLEWARE PARA VERIFICAR SE A REQUISIÇÃO E OS ARQUIVOS SÃO VÁLIDOS
    // APÓS ISSO, REALIZA UM UPLOAD
    await runMiddleware(req, res, upload.array("files"));

    const { files } = req;

    // CRIA UMA RELAÇÃO DE ENTRADAS BASEADAS NOS DADOS DE CADA ARQUIVO TRANSFERIDO
    const fileCatalogOnDb = await prisma.$transaction(
      files.map(({ size, path, mimetype, originalname, filename }) =>
        prisma.files.create({
          data: {
            fileLength: size.toString(),
            path,
            appSource,
            contentType: mimetype,
            originalName: originalname,
            name: filename,
            referenceObjId,
          },
        })
      )
    );

    return res.status(200).json(fileCatalogOnDb);
  } catch (e) {
    console.log(e);
    return res.status(500).json(e.message);
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
