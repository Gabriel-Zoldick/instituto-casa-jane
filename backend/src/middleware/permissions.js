const db = require('../database/connection');

// Default field permissions by role
const rolePermissions = {
  superadmin: ['*'],
  admin: ['*'],
  coordinator: ['id', 'name', 'birth_date', 'gender', 'person_type', 'phone', 'email', 'school', 'notes', 'photo_url', 'status'],
  viewer: ['id', 'name', 'person_type', 'status', 'photo_url']
};

const applyFieldPermissions = async (req, res, next) => {
  try {
    const userId = req.userId;
    const role = req.userRole;

    let allowedFields = [...(rolePermissions[role] || [])];

    // Override with custom permissions if any
    const { rows } = await db.query(
      'SELECT field_name, can_view FROM permission_overrides WHERE user_id = $1',
      [userId]
    );

    if (rows.length > 0 && !allowedFields.includes('*')) {
      for (const override of rows) {
        if (override.can_view && !allowedFields.includes(override.field_name)) {
          allowedFields.push(override.field_name);
        } else if (!override.can_view && allowedFields.includes(override.field_name)) {
          allowedFields = allowedFields.filter(f => f !== override.field_name);
        }
      }
    }

    req.allowedFields = allowedFields;

    // Helper function to filter object keys
    req.filterRecord = (record) => {
      if (allowedFields.includes('*')) return record;
      
      const filtered = {};
      for (const field of allowedFields) {
        if (record[field] !== undefined) {
          filtered[field] = record[field];
        }
      }
      return filtered;
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar permissões' });
  }
};

module.exports = { applyFieldPermissions };
