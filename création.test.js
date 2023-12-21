const supertest = require('supertest');
const assert = require('assert');
const app = require('./app'); // Remplacez ceci par le chemin correct vers votre application

describe('Test de la route POST /creation', () => {
    it('devrait rediriger vers la page de connexion si l utilisateur n est pas connecté', async () => {
        const response = await supertest(app).post('/creation')
        assert.strictEqual(response.status, 302); // Redirection après échec de la connexion
        assert.strictEqual(response.header['location'], '/login');
    });
});
