import Sequelize from 'sequelize';
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL + "?ssl=true", {
    dialiect: 'postgres',
    define: {underscored: true}
  })
} else {
  sequelize = new Sequelize('skycast', 'nathan', ' ', {
    dialect: 'postgres',
    define: {
      underscored: true,
    }
  });
}

const models = {
    User: sequelize.import('./user'),
    Query: sequelize.import('./query'),
};

Object.keys(models).forEach((modelName) => {
    if ('associate' in models[modelName]) {
        models[modelName].associate(models);
    }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;