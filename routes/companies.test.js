const app = require("../app");
const request = require("supertest")
const db = require("../db");

beforeEach( async () => {
    await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ('ibm', 'IBM', 'old company'), ('apple', 'APPLE', 'less old company')
        RETURNING code, name, description`,
        )
    });

afterEach( async () => {
    await db.query(
    `DELETE from companies
    WHERE code = 'ibm' `),

    await db.query(
    `DELETE from companies
    WHERE code = 'apple'`),

    await db.query(
        `DELETE from companies
        WHERE code = 'tesla'`)


});

describe("should correctly call methods", () => {
  test("gets all companies", async () => {
    const resp = await request(app).get('/companies');

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.companies.length).toEqual(2);
  });
});

describe("POST /companies", () => {
    test("test adding new company", async () => {
        const post = await request(app)
        .post(`/companies`)
        .send({ code:'tesla', name: 'Tesla', description:'cool new company' });
       
      expect(post.statusCode).toEqual(201);
      const resp = await request(app).get('/companies');
      expect(resp.body.companies.length).toEqual(3);


    });
  });

  describe("PUT /companies/:code", function () {
    test("Update a single company", async function () {
      const resp = await request(app)
          .put(`/companies/ibm`)
          .send({ code: 'ibm',name: "Troll", description: 'under the bridge' });
          //console.log(resp);
      expect(resp.statusCode).toEqual(200);
      expect(resp.body.company.name).toEqual('Troll'
      );
    });
  
    test("Respond with 404 if nout found", async function () {
      const resp = await request(app).patch(`/companies/0`);
      expect(resp.statusCode).toEqual(404);
    });
  });
  
  


