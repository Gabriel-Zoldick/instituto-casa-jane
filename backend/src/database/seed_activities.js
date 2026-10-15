const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('./connection');

async function seedActivities() {
  try {
    console.log('Iniciando atualização das oficinas e projetos...');

    // Atualiza aula de violão existente
    await db.query(`
      UPDATE projects 
      SET 
        category = 'Música',
        location = 'Comunidade de Alvorada, Vila Velha/ES',
        description = 'Aulas de violão para crianças e adolescentes, desenvolvendo coordenação, ritmo e expressão artística.'
      WHERE id = 1;
    `);

    const newProjects = [
      {
        name: 'Aulas de Violino',
        category: 'Música',
        description: 'Iniciação ao violino, desenvolvimento da postura, afinação e percepção musical para crianças e adolescentes.',
        status: 'active',
        schedule: 'Conforme turma na secretaria',
        location: 'Comunidade de Alvorada, Vila Velha/ES',
        max_capacity: 15
      },
      {
        name: 'Aulas de Teclado',
        category: 'Música',
        description: 'Estudo prático de teclado e piano, aprendizado de acordes, escalas e repertório popular e clássico.',
        status: 'active',
        schedule: 'Conforme turma na secretaria',
        location: 'Comunidade de Alvorada, Vila Velha/ES',
        max_capacity: 15
      },
      {
        name: 'Aulas de Flauta Doce',
        category: 'Música',
        description: 'Introdução à linguagem dos instrumentos de sopro, estimulando a respiração, ritmo e coordenação motora.',
        status: 'active',
        schedule: 'Conforme turma na secretaria',
        location: 'Comunidade de Alvorada, Vila Velha/ES',
        max_capacity: 15
      },
      {
        name: 'Teoria Musical',
        category: 'Música',
        description: 'Formação complementar com leitura de partituras, ritmo, solfejo e princípios fundamentais da música.',
        status: 'active',
        schedule: 'Conforme turma na secretaria',
        location: 'Comunidade de Alvorada, Vila Velha/ES',
        max_capacity: 20
      },
      {
        name: 'Aulas de Jiu-Jitsu',
        category: 'Esporte',
        description: 'Artes marciais promovendo disciplina, respeito mútuo, autocontrole, cidadania e condicionamento físico.',
        status: 'active',
        schedule: 'Conforme turma na secretaria',
        location: 'Comunidade de Alvorada, Vila Velha/ES',
        max_capacity: 25
      },
      {
        name: 'Xadrez & Raciocínio Lógico',
        category: 'Esporte & Lazer',
        description: 'Iniciativas pedagógicas e campeonatos de xadrez voltados ao desenvolvimento do raciocínio lógico, foco e paciência.',
        status: 'active',
        schedule: 'Conforme turma na secretaria',
        location: 'Comunidade de Alvorada, Vila Velha/ES',
        max_capacity: 20
      }
    ];

    for (const p of newProjects) {
      const check = await db.query('SELECT id FROM projects WHERE name = $1', [p.name]);
      if (check.rows.length === 0) {
        await db.query(`
          INSERT INTO projects (name, category, description, status, schedule, location, max_capacity)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [p.name, p.category, p.description, p.status, p.schedule, p.location, p.max_capacity]);
        console.log(`Projeto cadastrado: ${p.name}`);
      } else {
        console.log(`Projeto já existe: ${p.name}`);
      }
    }

    console.log('Oficinas cadastradas/atualizadas com sucesso!');
  } catch (err) {
    console.error('Erro ao atualizar oficinas:', err);
  } finally {
    db.pool.end();
  }
}

seedActivities();
