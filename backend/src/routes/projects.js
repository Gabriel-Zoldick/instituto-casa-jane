const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { applyFieldPermissions } = require('../middleware/permissions');

// Public list of active projects (no auth required)
router.get('/public', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT p.id, p.name, p.description, p.category, p.status, p.schedule, p.location, p.max_capacity,
              COUNT(pe.id)::int as enrollment_count
       FROM projects p
       LEFT JOIN project_enrollments pe ON pe.project_id = p.id AND pe.status = 'active'
       WHERE p.status = 'active'
       GROUP BY p.id
       ORDER BY p.name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar projetos públicos' });
  }
});

router.use(authMiddleware);

// Get accessible projects helper
const getUserAccessibleProjects = async (userId, role) => {
  if (role === 'superadmin' || role === 'admin') return null; // all
  
  const { rows } = await db.query('SELECT project_id FROM user_project_access WHERE user_id = $1', [userId]);
  return rows.map(r => r.project_id);
};

// List projects
router.get('/', async (req, res) => {
  try {
    const accessibleProjects = await getUserAccessibleProjects(req.userId, req.userRole);
    
    let query = 'SELECT p.*, u.name as coordinator_name FROM projects p LEFT JOIN users u ON p.coordinator_id = u.id';
    let params = [];

    if (accessibleProjects && accessibleProjects.length > 0) {
      query += ' WHERE p.id = ANY($1::int[])';
      params.push(accessibleProjects);
    } else if (accessibleProjects && accessibleProjects.length === 0) {
      return res.json([]); // No access
    }

    query += ' ORDER BY p.name ASC';

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar projetos' });
  }
});

// Create project
router.post('/', requireRole(['superadmin', 'admin']), async (req, res) => {
  try {
    const { name, description, category, status, coordinator_id, schedule, location, max_capacity } = req.body;

    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

    const query = `
      INSERT INTO projects (name, description, category, status, coordinator_id, schedule, location, max_capacity)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const params = [name, description, category, status || 'active', coordinator_id, schedule, location, max_capacity];

    const { rows } = await db.query(query, params);
    
    // If coordinator is assigned, give them access automatically
    if (coordinator_id) {
      await db.query('INSERT INTO user_project_access (user_id, project_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [coordinator_id, rows[0].id]);
    }
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar projeto' });
  }
});

// Get project details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const accessibleProjects = await getUserAccessibleProjects(req.userId, req.userRole);
    if (accessibleProjects && !accessibleProjects.includes(parseInt(id))) {
      return res.status(403).json({ error: 'Acesso negado a este projeto' });
    }

    const { rows } = await db.query(
      'SELECT p.*, u.name as coordinator_name FROM projects p LEFT JOIN users u ON p.coordinator_id = u.id WHERE p.id = $1', 
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar projeto' });
  }
});

// Update project
router.put('/:id', requireRole(['superadmin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, status, coordinator_id, schedule, location, max_capacity } = req.body;

    const query = `
      UPDATE projects 
      SET name = $1, description = $2, category = $3, status = $4, coordinator_id = $5, schedule = $6, location = $7, max_capacity = $8
      WHERE id = $9
      RETURNING *
    `;
    const params = [name, description, category, status, coordinator_id, schedule, location, max_capacity, id];

    const { rows } = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    if (coordinator_id) {
      await db.query('INSERT INTO user_project_access (user_id, project_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [coordinator_id, id]);
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar projeto' });
  }
});

// Delete project
router.delete('/:id', requireRole(['superadmin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query('DELETE FROM projects WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json({ message: 'Projeto excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir projeto' });
  }
});

// List people in project
router.get('/:id/people', applyFieldPermissions, async (req, res) => {
  try {
    const { id } = req.params;
    
    const accessibleProjects = await getUserAccessibleProjects(req.userId, req.userRole);
    if (accessibleProjects && !accessibleProjects.includes(parseInt(id))) {
      return res.status(403).json({ error: 'Acesso negado a este projeto' });
    }

    const { rows } = await db.query(`
      SELECT pe.id as enrollment_id, pe.status as enrollment_status, pe.class_group, pe.enrolled_at, p.*
      FROM project_enrollments pe
      JOIN people p ON pe.person_id = p.id
      WHERE pe.project_id = $1
      ORDER BY p.name ASC
    `, [id]);
    
    const filteredRows = rows.map(row => {
      const filtered = req.filterRecord(row);
      filtered.enrollment_id = row.enrollment_id;
      filtered.enrollment_status = row.enrollment_status;
      filtered.class_group = row.class_group;
      filtered.enrolled_at = row.enrolled_at;
      return filtered;
    });

    res.json(filteredRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar pessoas do projeto' });
  }
});

// Enroll person
router.post('/:id/enrollments', async (req, res) => {
  try {
    const { id } = req.params;
    const { person_id, status, class_group, notes } = req.body;
    
    // Role check simplified: assume if they can access the route, they can enroll. 
    // In strict app, verify if coordinator has access to this project
    const accessibleProjects = await getUserAccessibleProjects(req.userId, req.userRole);
    if (accessibleProjects && !accessibleProjects.includes(parseInt(id))) {
      return res.status(403).json({ error: 'Acesso negado a este projeto' });
    }

    const query = `
      INSERT INTO project_enrollments (person_id, project_id, status, class_group, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const params = [person_id, id, status || 'active', class_group, notes];

    const { rows } = await db.query(query, params);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.constraint === 'project_enrollments_person_id_project_id_key') {
      return res.status(400).json({ error: 'Pessoa já matriculada neste projeto' });
    }
    res.status(500).json({ error: 'Erro ao matricular pessoa' });
  }
});

// Update enrollment
router.put('/:id/enrollments/:enrollmentId', async (req, res) => {
  try {
    const { id, enrollmentId } = req.params;
    const { status, class_group, notes } = req.body;

    const accessibleProjects = await getUserAccessibleProjects(req.userId, req.userRole);
    if (accessibleProjects && !accessibleProjects.includes(parseInt(id))) {
      return res.status(403).json({ error: 'Acesso negado a este projeto' });
    }

    const query = `
      UPDATE project_enrollments 
      SET status = $1, class_group = $2, notes = $3
      WHERE id = $4 AND project_id = $5
      RETURNING *
    `;
    const { rows } = await db.query(query, [status, class_group, notes, enrollmentId, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Matrícula não encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar matrícula' });
  }
});

// Remove enrollment
router.delete('/:id/enrollments/:enrollmentId', async (req, res) => {
  try {
    const { id, enrollmentId } = req.params;

    const accessibleProjects = await getUserAccessibleProjects(req.userId, req.userRole);
    if (accessibleProjects && !accessibleProjects.includes(parseInt(id))) {
      return res.status(403).json({ error: 'Acesso negado a este projeto' });
    }

    const { rowCount } = await db.query('DELETE FROM project_enrollments WHERE id = $1 AND project_id = $2', [enrollmentId, id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Matrícula não encontrada' });
    }

    res.json({ message: 'Matrícula removida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover matrícula' });
  }
});

module.exports = router;
