const express = require('express');
const AzureService = require('../services/azure');


function azureApi (app){
    const router = express.Router();
    app.use("/api/azure", router);




    router.get("/", async function(req, res, next){
        const { tags } = req.query;
        console.log(req.query);
        try{
            const listPdf = await AzureService.ListPdf();

            res.status(200).json({
                data: listPdf,
                message: "Pdf encontrados "
            });
        }catch(err){
            next(err);
        }
    });

    router.get("/:namehospital/:namepaciente", async function(req, res, next){
        const { params } = req.params;
        console.log(req.params);
        try{
            const urlPdf = await AzureService.searchPdf(req.params.namehospital, req.params.namepaciente);
            console.log(urlPdf);
            res.status(200).json({
                data: urlPdf,
                message: "Pdf encontrado"
            });
        }catch(err){
            next(err);
        }
    });




}


module.exports = azureApi;











/*

const express = require('express');
const { hospitalesMock } = require('../utils/mocks/hospitales');

function hospitalesApi (app){
    const router = express.Router();
    app.use("/api/hospitales", router);

    router.get("/", async function(req, res, next){
        try{
            const hospitales = await Promise.resolve(hospitalesMock);

            res.status(200).json({
                data: hospitales,
                message: "hospitales listados"
            });
        }catch(err){
            next(err);
        }
    });

    router.get("/:hospitalId", async function(req, res, next){
        try{
            const hospitales = await Promise.resolve(hospitalesMock[0].id);

            res.status(200).json({
                data: hospitales,
                message: "hospital listad"
            });
        }catch(err){
            next(err);
        }
    });

    router.post("/", async function(req, res, next){
        try{
            const createdhospitale = await Promise.resolve(hospitalesMock[0].id);

            res.status(201).json({
                data: createdhospitale,
                message: "hospital Creado"
            });
        }catch(err){
            next(err);
        }
    });

    router.put("/:hospitalId", async function(req, res, next){
        try{
            const updatedhospital = await Promise.resolve(hospitalesMock[0].id);

            res.status(200).json({
                data: updatedhospital,
                message: "hospital actualizado"
            });
        }catch(err){
            next(err);
        }
    });

    router.delete("/:hospitalId", async function(req, res, next){
        try{
            const deletedhospitales = await Promise.resolve(hospitalesMock[0].id);

            res.status(200).json({
                data: deletedhospitales,
                message: "hospital eliminado"
            });
        }catch(err){
            next(err);
        }
    });

    



}


module.exports = hospitalesApi;
*/