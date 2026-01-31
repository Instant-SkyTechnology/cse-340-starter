const pool = require("../database/")

/* ****************************
 *  Get all classification data
 * ****************************/
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* *********************************************************************
 *  Get all inventory items and classification_name by classification_id
 * *********************************************************************/
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ******************************
 *  Get inventory item by inv_id
 * ******************************/
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory
       JOIN public.classification
       ON inventory.classification_id = classification.classification_id
       WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    throw new Error("getInventoryById error: " + error)
  }
}

/* *******************************
 * Add a new classification
 * *******************************/
async function addClassification(classification_name) {
  try {
    const sql = `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *`
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]  // returns the newly inserted row
  } catch (error) {
    console.error("addClassification error:", error)
    return null
  }
}

/* *******************************
 * Add a new inventory item
 * *******************************/
async function addInventoryItem(
  classification_id, inv_make, inv_model, inv_year,
  inv_description, inv_image, inv_thumbnail,
  inv_price, inv_miles, inv_color
) {
  try {
    const sql = `INSERT INTO public.inventory 
      (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`
    const result = await pool.query(sql, [
      classification_id, inv_make, inv_model, inv_year,
      inv_description, inv_image, inv_thumbnail,
      inv_price, inv_miles, inv_color
    ])
    return result.rows[0]
  } catch (error) {
    console.error("addInventoryItem error:", error)
    return null
  }
}

/* ******************************
 * Get the last added inventory item
 * ******************************/
async function getLatestInventory(limit = 1) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
       JOIN public.classification AS c
       ON i.classification_id = c.classification_id
       ORDER BY i.inv_id DESC
       LIMIT $1`,
      [limit]
    )
    return data.rows
  } catch (error) {
    console.error("getLatestInventory error:", error)
    return []
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getInventoryById, addClassification, addInventoryItem, getLatestInventory};