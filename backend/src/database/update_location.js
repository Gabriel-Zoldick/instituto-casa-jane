const db = require('./connection');

async function updateLocations() {
  try {
    const res = await db.query(
      "UPDATE projects SET location = 'Igreja ADMV (Rua Tarumã, 53, Alvorada)' WHERE location LIKE '%Alvorada%'"
    );
    console.log('Successfully updated project locations:', res.rowCount);
  } catch (err) {
    console.error('Error updating locations:', err);
  } finally {
    process.exit(0);
  }
}

updateLocations();
