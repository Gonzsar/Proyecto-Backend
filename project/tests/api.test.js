import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../src/server.js';
const expect = chai.expect;

chai.use(chaiHttp);

describe('Rutas de vistas', () => {
    describe('GET /', () => {
        it('debería renderizar la página de inicio con productos', (done) => {
            chai.request(app)
                .get('/')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.text).to.include('<title>Inicio</title>'); // Comprobando contenido HTML
                    done();
                });
        });
    });

    describe('GET /realtimeproducts', () => {
        it('debería renderizar la página de productos en tiempo real', (done) => {
            chai.request(app)
                .get('/realtimeproducts')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.text).to.include('<title>Productos en Tiempo Real</title>'); // Comprobando contenido HTML
                    done();
                });
        });
    });
});