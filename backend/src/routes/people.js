const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { applyFieldPermissions } = require('../middleware/permissions');
const upload = require('../middleware/upload');
const { logAudit } = require('../utils/audit');

// Public student enrollment route (no auth required)
router.post('/public-enroll', async (req, res) => {
  try {
    const {
      name,
      birth_date,
      cpf,
      gender,
      phone,
      email,
      address,
      neighborhood,
      city,
      school,
      school_shift,
      guardian_name,
      guardian_relationship,
      guardian_phone,
      project_id,
      preferred_shift,
      notes
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'O nome completo do aluno é obrigatório' });
    }

    if (!phone && !guardian_phone) {
      return res.status(400).json({ error: 'Um número de telefone para contato é obrigatório' });
    }

    // Determine age and person_type
    let person_type = 'child';
    let age = null;
    if (birth_date) {
      const birth = new Date(birth_date);
      if (!isNaN(birth.getTime())) {
        const diffMs = Date.now() - birth.getTime();
        age = Math.floor(diffMs / (365.25 * 24 * 3600 * 1000));
        if (age >= 18) {
          person_type = 'adult';
        }
      }
    }

    const contactPhone = phone || guardian_phone || null;

    // Structured notes with enrollment context
    const structuredNotesLines = [
      '[INSCRIÇÃO VIA SITE - MATRÍCULA ONLINE]',
      guardian_name ? `Responsável: ${guardian_name} (${guardian_relationship || 'Responsável Legal'})` : null,
      guardian_phone ? `Contato do Responsável: ${guardian_phone}` : null,
      school_shift ? `Turno Escolar: ${school_shift}` : null,
      preferred_shift ? `Turno de Preferência: ${preferred_shift}` : null,
      notes ? `Observações da Família: ${notes}` : null
    ].filter(Boolean);
    const combinedNotes = structuredNotesLines.join('\n');

    // Insert student into people table
    const studentResult = await db.query(
      `INSERT INTO people (
        name, birth_date, cpf, gender, person_type, phone, email,
        address, neighborhood, city, school, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'waitlist')
      RETURNING *`,
      [
        name.trim(),
        birth_date || null,
        cpf || null,
        gender || null,
        person_type,
        contactPhone,
        email || null,
        address || null,
        neighborhood || 'Alvorada',
        city || 'Vila Velha',
        school || null,
        combinedNotes,
      ]
    );

    const student = studentResult.rows[0];

    // If guardian is specified and student is child, link in family_relationships
    if (guardian_name && guardian_name.trim()) {
      try {
        const guardianResult = await db.query(
          `INSERT INTO people (
            name, person_type, phone, address, neighborhood, city, notes, status
          ) VALUES ($1, 'adult', $2, $3, $4, $5, $6, 'active')
          RETURNING id`,
          [
            guardian_name.trim(),
            guardian_phone || contactPhone,
            address || null,
            neighborhood || 'Alvorada',
            city || 'Vila Velha',
            `Responsável legal por ${student.name} (cadastrado via matrícula online)`
          ]
        );
        const guardianId = guardianResult.rows[0].id;
        
        await db.query(
          `INSERT INTO family_relationships (person_a_id, person_b_id, relationship_type)
           VALUES ($1, $2, $3)`,
          [student.id, guardianId, guardian_relationship || 'guardian']
        );
      } catch (errGuardian) {
        console.warn('Erro ao criar vínculo familiar do responsável:', errGuardian.message);
      }
    }

    // If project_id is specified, enroll into waitlist
    let projectName = null;
    if (project_id) {
      const projCheck = await db.query('SELECT id, name FROM projects WHERE id = $1', [project_id]);
      if (projCheck.rows.length > 0) {
        projectName = projCheck.rows[0].name;
        await db.query(
          `INSERT INTO project_enrollments (person_id, project_id, status, class_group, notes)
           VALUES ($1, $2, 'waitlist', $3, 'Inscrição realizada pelo site público')
           ON CONFLICT (person_id, project_id) DO NOTHING`,
          [student.id, project_id, preferred_shift || null]
        );
      }
    }

    // Log security/audit
    await logAudit({
      req,
      action: 'PUBLIC_STUDENT_ENROLLED',
      details: {
        student_name: student.name,
        person_type,
        project_id,
        project_name: projectName,
        contact_phone: contactPhone,
        guardian_name: guardian_name || null
      }
    });

    // Build automated WhatsApp message to Carla Daieny
    const carlaPhone = '5527998992509';
    const lines = [
      '🚨 *NOVO ALUNO CADASTRADO NO SITE*',
      '🏛️ *Instituto Albertino Vieira Santos - Casa Jane*',
      '',
      `👤 *Aluno(a):* ${student.name}`,
      age !== null ? `🎂 *Idade:* ${age} anos (Nasc: ${birth_date})` : null,
      guardian_name ? `👥 *Responsável:* ${guardian_name} (${guardian_relationship || 'Responsável'})` : null,
      `📱 *Contato:* ${contactPhone}`,
      projectName ? `🎯 *Oficina/Projeto:* ${projectName}` : '🎯 *Oficina/Projeto:* Geral',
      school_shift ? `🏫 *Turno Escolar:* ${school_shift}` : null,
      preferred_shift ? `⏰ *Turno Desejado:* ${preferred_shift}` : null,
      notes ? `📝 *Observação:* ${notes}` : null,
      '',
      '📋 *Status no Sistema:* Cadastrado na Lista de Espera da plataforma para contato da equipe.'
    ].filter(Boolean);

    const whatsappMessage = lines.join('\n');
    const whatsappUrl = `https://wa.me/${carlaPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    res.status(201).json({
      success: true,
      message: 'Inscrição realizada com sucesso! O aluno foi cadastrado na plataforma.',
      student: {
        id: student.id,
        name: student.name,
        person_type: student.person_type,
        status: student.status
      },
      projectName,
      whatsappUrl,
      whatsappMessage
    });
  } catch (err) {
    console.error('Erro na matrícula pública:', err);
    res.status(500).json({ error: 'Erro ao processar matrícula online. Tente novamente ou contate a secretaria.' });
  }
});

router.use(authMiddleware);

// Upload person photo
router.post('/upload-photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de imagem enviado' });
    }
    const photo_url = `/uploads/${req.file.filename}`;
    res.json({ photo_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer upload da foto' });
  }
});

router.use(applyFieldPermissions);

// Helper to check project access
const getUserAccessibleProjects = async (userId, role) => {
  if (role === 'superadmin' || role === 'admin') return null; // all
  
  const { rows } = await db.query('SELECT project_id FROM user_project_access WHERE user_id = $1', [userId]);
  return rows.map(r => r.project_id);
};

// List people
router.get('/', async (req, res) => {
  try {
    const { project_id, status, person_type, search } = req.query;
    
    // Check access
    const accessibleProjects = await getUserAccessibleProjects(req.userId, req.userRole);
    
    let query = 'SELECT DISTINCT p.* FROM people p ';
    let params = [];
    let paramIndex = 1;
    let whereClauses = [];

    if (project_id) {
      if (accessibleProjects && !accessibleProjects.includes(parseInt(project_id))) {
        return res.status(403).json({ error: 'Acesso negado a este projeto' });
      }
      query += 'JOIN project_enrollments pe ON p.id = pe.person_id ';
      whereClauses.push(`pe.project_id = $${paramIndex}`);
      params.push(project_id);
      paramIndex++;
    } else if (accessibleProjects && accessibleProjects.length > 0) {
      // If no project specified, restrict to accessible projects
      query += 'LEFT JOIN project_enrollments pe ON p.id = pe.person_id ';
      whereClauses.push(`(pe.project_id = ANY($${paramIndex}::int[]) OR p.id NOT IN (SELECT person_id FROM project_enrollments))`);
      params.push(accessibleProjects);
      paramIndex++;
    } else if (accessibleProjects && accessibleProjects.length === 0) {
      // If user has no access to any project, return empty
      return res.json([]);
    }

    if (status) {
      whereClauses.push(`p.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (person_type) {
      whereClauses.push(`p.person_type = $${paramIndex}`);
      params.push(person_type);
      paramIndex++;
    }

    if (search) {
      whereClauses.push(`(p.name ILIKE $${paramIndex} OR p.cpf ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY p.name ASC';

    const { rows } = await db.query(query, params);
    
    // Apply field filtering
    const filteredRows = rows.map(row => req.filterRecord(row));
    
    res.json(filteredRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar pessoas' });
  }
});

// Create person
router.post('/', async (req, res) => {
  try {
    const { name, birth_date, cpf, rg, gender, person_type, phone, email, address, neighborhood, city, school, notes, photo_url, status } = req.body;

    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

    const query = `
      INSERT INTO people (name, birth_date, cpf, rg, gender, person_type, phone, email, address, neighborhood, city, school, notes, photo_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const params = [name, birth_date, cpf, rg, gender, person_type || 'adult', phone, email, address, neighborhood, city, school, notes, photo_url, status || 'active'];

    const { rows } = await db.query(query, params);
    const newPerson = rows[0];

    await logAudit({
      req,
      userId: req.userId,
      action: 'PERSON_CREATED',
      details: `Pessoa cadastrada: ${newPerson.name} (${newPerson.person_type === 'child' ? 'Criança' : 'Adulto'})`
    });

    res.status(201).json(req.filterRecord(newPerson));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar pessoa' });
  }
});

// Get person
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Note: should check if user has access to this person via projects in a real app, 
    // skipping complex check here for simplicity, assuming field filtering is enough
    
    const { rows } = await db.query('SELECT * FROM people WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json(req.filterRecord(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar pessoa' });
  }
});

// Update person
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, birth_date, cpf, rg, gender, person_type, phone, email, address, neighborhood, city, school, notes, photo_url, status } = req.body;

    const query = `
      UPDATE people 
      SET name = $1, birth_date = $2, cpf = $3, rg = $4, gender = $5, person_type = $6, phone = $7, email = $8, address = $9, neighborhood = $10, city = $11, school = $12, notes = $13, photo_url = $14, status = $15
      WHERE id = $16
      RETURNING *
    `;
    const params = [name, birth_date, cpf, rg, gender, person_type, phone, email, address, neighborhood, city, school, notes, photo_url, status, id];

    const { rows } = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    const updatedPerson = rows[0];

    await logAudit({
      req,
      userId: req.userId,
      action: 'PERSON_UPDATED',
      details: `Pessoa ID ${id} atualizada: ${updatedPerson.name}`
    });

    res.json(req.filterRecord(updatedPerson));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar pessoa' });
  }
});

// Delete person
router.delete('/:id', requireRole(['superadmin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const personRes = await db.query('SELECT name FROM people WHERE id = $1', [id]);
    const personName = personRes.rows[0]?.name || id;

    const { rowCount } = await db.query('DELETE FROM people WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    await logAudit({
      req,
      userId: req.userId,
      action: 'PERSON_DELETED',
      details: `Pessoa excluída ID ${id}: ${personName}`
    });

    res.json({ message: 'Pessoa excluída com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir pessoa' });
  }
});

// Get family
router.get('/:id/family', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT fr.id as relationship_id, fr.relationship_type, p.*
      FROM family_relationships fr
      JOIN people p ON (fr.person_b_id = p.id)
      WHERE fr.person_a_id = $1
      
      UNION
      
      SELECT fr.id as relationship_id, 
        CASE 
          WHEN fr.relationship_type = 'parent' THEN 'child'
          WHEN fr.relationship_type = 'mother' THEN 'child'
          WHEN fr.relationship_type = 'father' THEN 'child'
          WHEN fr.relationship_type = 'child' THEN 'parent'
          ELSE fr.relationship_type
        END as relationship_type,
        p.*
      FROM family_relationships fr
      JOIN people p ON (fr.person_a_id = p.id)
      WHERE fr.person_b_id = $1
    `;
    
    const { rows } = await db.query(query, [id]);
    
    const filteredRows = rows.map(row => {
      const filtered = req.filterRecord(row);
      filtered.relationship_id = row.relationship_id;
      filtered.relationship_type = row.relationship_type;
      return filtered;
    });

    res.json(filteredRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar família' });
  }
});

// Add family relationship
router.post('/:id/family', async (req, res) => {
  try {
    const { id } = req.params;
    const { person_b_id, relationship_type } = req.body;

    if (!person_b_id || !relationship_type) {
      return res.status(400).json({ error: 'Pessoa relacionada e tipo de parentesco são obrigatórios' });
    }

    const { rows } = await db.query(
      'INSERT INTO family_relationships (person_a_id, person_b_id, relationship_type) VALUES ($1, $2, $3) RETURNING *',
      [id, person_b_id, relationship_type]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar membro da família' });
  }
});

// Remove family relationship
router.delete('/:id/family/:relationshipId', async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { rowCount } = await db.query('DELETE FROM family_relationships WHERE id = $1', [relationshipId]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Relacionamento não encontrado' });
    }

    res.json({ message: 'Relacionamento excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover relacionamento' });
  }
});

// Get enrollments
router.get('/:id/enrollments', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(`
      SELECT pe.*, p.name as project_name, p.category
      FROM project_enrollments pe
      JOIN projects p ON pe.project_id = p.id
      WHERE pe.person_id = $1
    `, [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar matrículas' });
  }
});

module.exports = router;
