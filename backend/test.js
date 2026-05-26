const { sequelize, User } = require('./models');

async function test() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');
    const user = await User.create({ name: 'Test', email: 'test@test.com', password: 'password' });
    console.log('User created:', user.email);
    console.log('TEST_SUCCESS');
  } catch (err) {
    console.error('TEST_ERROR:', err);
  } finally {
    process.exit(0);
  }
}
test();
