const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AdminModel = require('../Models/AdminModel');

async function adminLogin(req, res) {
    const { employee_id, password } = req.body;
      if (!employee_id || !password) {
        return res.status(400).json({ message: 'Missing credentials' });
    }
    try {
        const admin = await AdminModel.getAdminByEmployeeId(employee_id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const validPassword = await bcrypt.compare(password, admin.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }
        const token = jwt.sign(
            {
                admin_id: admin.admin_id,
                employee_id: admin.employee_id,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );
        res.json({
            token,
            admin: {
                admin_id: admin.admin_id,
                employee_id: admin.employee_id,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed: ' + error.message });
    }
} 

module.exports = {
  adminLogin
};