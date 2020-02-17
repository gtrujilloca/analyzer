const express = require('express');
const HospitalesService = require('../services/hospitales');


function hospitalesApi (app){
    const router = express.Router();
    app.use("/api/hospitales", router);

    const hospitalesService = new HospitalesService();




    router.get("/", async function(req, res, next){
        const { tags } = req.query;
        console.log(req.query);
        try{
            const hospitales = await hospitalesService.getHospitales({ tags });

            res.status(200).json({
                data: hospitales,
                message: "hospitales listados"
            });
        }catch(err){
            next(err);
        }
    });


    // router.get("/:hospitalId", async function(req, res, next){
    //     const { hospitalId } = req.params;
        
    //     try{
    //         const hospitales = await hospitalesService.getHospital({ hospitalId });

    //         res.status(200).json({
    //             data: hospitales,
    //             message: "hospital listados"
    //         });
    //     }catch(err){
    //         next(err);
    //     }
    // });


    router.post("/", async function(req, res, next){
        const { body: hospital } = req;
        
        try{
            const createHospitales = await hospitalesService.createHospital({ hospital });

            res.status(201).json({
                data: createHospitales,
                message: "hospital creado"
            });
        }catch(err){
            next(err);
        }
    });

    router.put("/:hospitalId", async function(req, res, next){
        const { hospitalId } = req.params;
        const { body: hospital } = req;
        
        try{
            const updateHospitales = await hospitalesService.updateHospital({
                 hospitalId,
                hospital
             });

            res.status(200).json({
                data: updateHospitales,
                message: "hospital actualizado"
            });
        }catch(err){
            next(err);
        }
    });


    router.delete("/:hospitalId", async function(req, res, next){
        const { hospitalId } = req.params;
        
        try{
            const deleteHospitales = await hospitalesService.deleteHospital({
                 hospitalId
             });

            res.status(200).json({
                data: deleteHospitales,
                message: "hospital eliminado"
            });
        }catch(err){
            next(err);
        }
    });

    router.get("/readfile", async function(req, res, next){
        const { tags } = req.query;

        try{
            const hospitales = await hospitalesService.readFile({ tags });
            
            res.status(200).json({
                data: hospitales,
                message: "hospitales listados"
            });
        }catch(err){
            next(err);
        }
    });

    router.post("/automator/:id", async function(req, res, next){
        const { hospital } = req.param;
        console.log(hospital);
        try{
            
            const createHospitales = await hospitalesService.automatorWatcher({  });

            res.status(201).json({
                data: createHospitales,
                message: "hospital creado"
            });
        }catch(err){
            next(err);
        }
    });




}




module.exports = hospitalesApi;

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