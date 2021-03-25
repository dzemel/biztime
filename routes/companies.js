const express = require("express");
const db = require("../db");
const router = express.Router();
const {NotFoundError, BadRequestError} = require('../expressError');

router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name
            FROM companies`
  );
  const companies = results.rows;

  return res.json({ companies });
});


router.get("/:code", async function (req, res, next) {
  const code = req.params.code;
  const cResult = await db.query(
    `SELECT code, name, description
        FROM companies 
        WHERE code = $1`,
    [code]
  );
  const company = cResult.rows[0];
  if(!company) throw new NotFoundError(`Not found: ${code}`);
  
  const iResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
        FROM invoices 
        WHERE comp_code = $1`,
    [code]
  );

  const invoices = iResults.rows;

company.invoices = invoices;

  return res.json({ company});
});

router.post("/", async function (req, res, next) {
  const { code, name, description } = req.body;

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
    [code, name, description]
  );
  const company = result.rows[0];
//check if company already exists
  return res.status(201).json({ company });
});

router.put('/:code', async function (req, res, next) {
  const {name, description} = req.body;
  
  const result = await db.query(
    `UPDATE companies
    SET name = $1, description = $2
    WHERE code =$3 
    RETURNING code, name, description`,
    [name, description, req.params.code]
  );
  const company = result.rows[0];
  if(!company) throw new NotFoundError(`Not found: ${req.params.code}`)
  return res.status(200).json({company});
})

router.delete('/:code', async function (req, res, next) {

  const result = await db.query(
    `DELETE from companies
    WHERE code = $1`,
  [req.params.code]
  );
    console.log(result);
  if(result.rowCount < 1) throw new NotFoundError(`Not found: ${req.params.code}`);
  return res.json({message: `Deleted`})
})

module.exports = router;
