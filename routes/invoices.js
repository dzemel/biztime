const express = require("express");
const db = require("../db");
const router = express.Router();
const {NotFoundError, BadRequestError} = require('../expressError');

router.get("/", async function (req, res, next) {
    const results = await db.query(
      `SELECT id, comp_code
      FROM invoices`
    );

    const invoices = results.rows;
    return res.json({ invoices });
  });

  //{invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
  router.get("/:id", async function (req, res, next) {

    const id = req.params.id;
    const result1 = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, comp_code
      FROM invoices 
      WHERE id = $1`,
      [id]
    );
    
    if(result1.rowCount < 1) throw new NotFoundError(`Not found: ${id}`);

        const result2 = await db.query(
          `SELECT code, name, description
              FROM companies 
              WHERE code = $1`,
          [result1.rows[0].comp_code]
        );
        
        let invoice = result1.rows[0];
        let company = result2.rows;

        delete invoice.comp_code;
        invoice.company = company
        const result = {invoice};

        return res.json(result);
      });


router.post("/", async function (req, res, next) {
    const { comp_code, amt } = req.body;
  
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
       VALUES ($1, $2)
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
       [comp_code, amt]
    );

    const invoice = result.rows[0];
    return res.status(201).json({ invoice });
  });

router.put("/:id", async function (req, res, next) {
    const {amt} = req.body;
  
    const result = await db.query(
        `UPDATE invoices
        SET amt = $1
        WHERE id =$2 
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [amt, req.params.id]
    );

    const invoice = result.rows[0];
    if(!invoice) throw new NotFoundError(`Not found: ${req.params.id}`)
    return res.json({ invoice });
  });

  router.delete('/:id', async function (req, res, next) {

    const result = await db.query(
      `DELETE from invoices
       WHERE id = $1`,
       [req.params.id]
    );

    if(!result.rowCount[0]) throw new NotFoundError(`Not found: ${req.params.id}`);
    return res.json({message: `Deleted`})
  })



  module.exports = router;