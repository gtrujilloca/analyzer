const { hospitalesMock } = require('../utils/mocks/hospitales');
const fs = require("fs");

class HospitalesService {

    async getHospitales(){ 
        const hospitales = await Promise.resolve(hospitalesMock);
        return hospitales || [];
    }

    async getHospital(){
        const hospital = await Promise.resolve(hospitalesMock[0].id);
        return hospital || {};
    }

    async createHospital(){
        const createHospitalId = await Promise.resolve(hospitalesMock[0].id);
        return createHospitalId;
    }

    async updateHospital(){
        const updatedHospitalId = await Promise.resolve(hospitalesMock[0].id);
        return updatedHospitalId;
    }

    async deleteHospital(){
        const deletedHospitalId = await Promise.resolve(hospitalesMock[0].id);
        return deletedHospitalId;
    }


}


module.exports = HospitalesService;

