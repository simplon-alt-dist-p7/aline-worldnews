import express from 'express';
import request from 'supertest';
import { geminiController } from '../../controller/gemini.controller.js';
import { geminiService } from '../../services/gemini.service.js';

//Test Gemini : service externe donc on mock !
//remplace le module gemini.service 
jest.mock('../../services/gemini.service.js', () => ({
  geminiService: { //objet idem au serviceréel 
    generateTitle: jest.fn(), //fonction mockée + fonction fausse
  },
}));

// j'ai test sans mock = erreur 429 
// 429 Too Many Requests
// Le controller appelle réellement le service Gemini Qui appelle l’API IA Qui peut : 
// // être ralentie, être limitée en quota, ou coûter des appels

// construction de l'app express pour tester le controller et la route
const app = express();
app.use(express.json());
app.post('/generate-titre', geminiController.generateTitle);

describe('POST /generate-titre', () => {
    it('doit générer un titre à partir du body de l\'article', async () => { //explique ce que fait le test

        (geminiService.generateTitle as jest.Mock) //jest considère que la fonction est un mock
            .mockResolvedValue('Titre généré par l\'IA'); // on a précisé plus haut que la fonction mockée = une fonction fausse donc qu'on peut faire ce qu'on veut avec. 
            //ici on dit que la fonction mockée va retourner une promesse résolue avec la valeur 'Titre généré par l'IA'
        
        const response = await request(app) //variable pour simuler la requête http à l'app express
            .post('/generate-titre')
            .send({ body: 'n\'importe quoi' });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Titre généré avec succès');
    });
});