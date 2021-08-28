//Importación de clases
const classDaoSql = require("../repository/daoSolicitudes");

class interfaceDAOSolicitudes {
    async setSolicitud(data) {
        const dao = new classDaoSql();
        let result = dao.setSolicitud(data);
        return result;
    }

    async setAuditoriaSolicitud(data) {
        const dao = new classDaoSql();
        let result = dao.setAuditoriaSolicitud(data);
        return result;
    }

    async getSolicitudes(data) {
        const dao = new classDaoSql();
        let result = dao.getSolicitudes(data);
        return result;
    }

    async getSolicitudesAprobador(data) {
        const dao = new classDaoSql();
        let result = dao.getSolicitudesAprobador(data);
        return result;
    }

    async updateSolicitud(data) {
        const dao = new classDaoSql();
        let result = dao.updateSolicitud(data);
        return result;
    }

    async deleteSolicitud(data) {
        const dao = new classDaoSql();
        let result = dao.deleteSolicitud(data);
        return result;
    }

    async setAprobadores(data) {
        const dao = new classDaoSql();
        let result = dao.setAprobadores(data);
        return result;
    }

    async updateAprobador(data) {
        const dao = new classDaoSql();
        let result = dao.updateAprobador(data);
        return result;
    }

    async setFlujoSolicitud(data) {
        const dao = new classDaoSql();
        let result = dao.setFlujoSolicitud(data);
        return result;
    }

    async getFlujosSolicitud(data) {
        const dao = new classDaoSql();
        let result = dao.getFlujosSolicitud(data);
        return result;
    }

    async getMotivosNoReemplazo(data) {
        const dao = new classDaoSql();
        let result = dao.getMotivosNoReemplazo(data);
        return result;
    }

    async getMotivosCancelacion(data) {
        const dao = new classDaoSql();
        let result = dao.getMotivosCancelacion(data);
        return result;
    }

    async getSolicitudesCanceladas(data) {
        const dao = new classDaoSql();
        let result = dao.getSolicitudesCanceladas(data);
        return result;
    }

    async getSolicitudesCanceladasAprobador(data) {
        const dao = new classDaoSql();
        let result = dao.getSolicitudesCanceladasAprobador(data);
        return result;
    }

    async setCancelacionSolicitud(data) {
        const dao = new classDaoSql();
        let result = dao.setCancelacionSolicitud(data);
        return result;
    }

    async deleteSolicitudCancelacion(data) {
        const dao = new classDaoSql();
        let result = dao.deleteSolicitudCancelacion(data);
        return result;
    }
}

module.exports = interfaceDAOSolicitudes;
