const request = require('supertest');
const assert = require('assert');
const app = require('./app');

describe('Test des routes de login', () => {
    it('devrait afficher se connecter dans l en tête si pas d utilisateur connecter', async () => {
        const response = await request(app).get('/');
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.text.includes('Se connecter'), true);
    });
    it('devrait se connecter avec succès', async () => {
        const response = await request(app).post('/login').send({loginUsername: 'test', loginPassword: 'test',});
        assert.strictEqual(response.status, 302); // Redirection après une connexion réussie
    });
    it('devrait s inscrire avec succès', async () => {
        const response = await request(app).post('/login').send({registerUsername: 'test4', registerPassword: 'test4',});
        assert.strictEqual(response.status, 302);
    });
    it('devrait s inscrire avec succès même si un autre utilisateur à le même mot de passe', async () => {
        const response = await request(app).post('/login').send({registerUsername: 'b-test', registerPassword: 'test',});
        assert.strictEqual(response.status, 302);
    });
});

