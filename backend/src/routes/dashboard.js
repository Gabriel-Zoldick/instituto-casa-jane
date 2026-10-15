const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      total_people: 0,
      active_people: 0,
      children: 0,
      adults: 0,
      active_projects: 0,
      recent_enrollments: []
    };

    const peopleCount = await db.query('SELECT COUNT(*) as count FROM people');
    stats.total_people = parseInt(peopleCount.rows[0].count);

    const activeCount = await db.query("SELECT COUNT(*) as count FROM people WHERE status = 'active'");
    stats.active_people = parseInt(activeCount.rows[0].count);

    const childrenCount = await db.query("SELECT COUNT(*) as count FROM people WHERE person_type = 'child'");
    stats.children = parseInt(childrenCount.rows[0].count);

    const adultsCount = await db.query("SELECT COUNT(*) as count FROM people WHERE person_type = 'adult'");
    stats.adults = parseInt(adultsCount.rows[0].count);

    const activeProjectsCount = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'active'");
    stats.active_projects = parseInt(activeProjectsCount.rows[0].count);

    const { rows: recentEnrollments } = await db.query(`
      SELECT pe.id, pe.enrolled_at, p.name as person_name, pr.name as project_name 
      FROM project_enrollments pe
      JOIN people p ON pe.person_id = p.id
      JOIN projects pr ON pe.project_id = pr.id
      ORDER BY pe.enrolled_at DESC
      LIMIT 10
    `);
    stats.recent_enrollments = recentEnrollments;

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});


module.exports = router;
