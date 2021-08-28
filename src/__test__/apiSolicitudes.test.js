const expect = require("chai").expect;

/**
 * Test a los endpoints de las solicitudes
 */
describe("Pruebas unitarias al dominio de Solicitudes", () => {
    const dataUser = {
        strNombre: "Snayder",
        strApellidos: "Londoño Gallego ",
        strEmail: "slondonog@choucairtesting.com",
        strUsuario: "slondonog",
        strCargo: "ANALISTA DE SOLUCIONES ",
        strArea: "TI ",
        strRolApp: [],
        strCcosto: "1101000000",
        strUEN: null,
        strPaisNomina: "COLOMBIA",
        strCiudadNomina: "MEDELLIN",
        iat: 1626963121,
        exp: 1626984721,
    };

    it("setSolicitudVacaciones (servicio de guardar una solicitud de vacaciones)  ", async () => {
        const classPostSolicitudes = require("../modules/solicitudes/domain/setSolicitudVacaciones.service");

        let data = {
            dtFechaInicio: "2021-07-30",
            intNumeroDiasDisfrutar: 3,
            intNumeroDiasCompensar: 0,
            arrAprobadores: "scardonas@choucairtesting.com",
        };

        let service = new classPostSolicitudes(data, dataUser);
        let result = await service.main();

        expect(result).to.have.property("error", false);
        expect(result).to.have.property(
            "msg",
            `La solicitud #${result.data.intId}, fue registrada con éxito.`
        );

        expect(result).to.have.property("data");
    });

    it("getSolicitudes (Servicio que consulta las solicitudes de Vacaciones)", async () => {
        const serviceGetSolicitudes = require("../modules/solicitudes/domain/getSolicitudes.service");
        let objParams = {
            strEmailColaborador: dataUser.strEmail,
            intIdSolicitud: 54,
            intIdEstado: 1,
            intIdTipoSolicitud: 1,
        };

        let result = await serviceGetSolicitudes(objParams);
        expect(result).to.have.property("error", false);
        expect(result).to.have.property("data");
    });

    it("getFlujosSolicitudes (Servicio que consulta los flujos de los servicios)", async () => {
        const serviceGetFlujosSolicitud = require("../modules/solicitudes/domain/getFlujosSolicitud.service");
        let objParams = {
            intIdSolicitud: 28,
            intIdFlujo: 21,
        };
        let result = await serviceGetFlujosSolicitud(objParams);
        expect(result).to.have.property("error", false);
        expect(result).to.have.property("data");
    });

    it("getSolicitudAprobadores", async () => {
        const serviceGetSolicitudesAprobador = require("../modules/solicitudes/domain/getSolicitudesAprobador.service");
        let objParams = {
            strEmailAprobador: "scardonas@choucairtesting.com",
            strEmailColaborador: dataUser.strEmail,
            intIdSolicitud: 54,
            intIdEstado: 1,
            intIdTipoSolicitud: 1,
        };

        let result = await serviceGetSolicitudesAprobador(objParams, dataUser);
        expect(result).to.have.property("error", false);
        expect(result).to.have.property("data");
    });
});
