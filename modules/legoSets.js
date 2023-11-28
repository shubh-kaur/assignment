const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Sequelize = require('sequelize');

let sequelize = new Sequelize({
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: 'postgres',
  ssl: { rejectUnauthorized: false },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  define: {
    timestamps: false,
  },
});

const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING,
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function getAllThemes() {
  return Theme.findAll();
}

function getThemeDataFromDB() {
  return Theme.findAll();
}

function Initialize() {
  return getThemeDataFromDB()
    .then((themes) => {
      console.log('Themes fetched from the database:', themes);
      return sequelize.sync();
    })
    .then(() => {
      console.log('Database synchronized');
    })
    .catch((err) => {
      console.error('Error:', err);
      throw err; // Reject the promise with the error
    });
}

function getAllSets() {
  return Set.findAll({ include: [Theme] });
}

function getSetByNum(setNum) {
  return Set.findOne({
    where: { set_num: setNum },
    include: [Theme],
  }).then((set) => {
    if (set) {
      return set;
    } else {
      throw new Error("Unable to find requested set");
    }
  });
}

function getSetsByTheme(theme) {
  return Set.findAll({
    include: [Theme],
    where: {
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`,
      },
    },
  }).then((sets) => {
    if (sets.length > 0) {
      return sets;
    } else {
      throw new Error("Unable to find requested sets");
    }
  });
}

function editSet(setNum, setData) {
  return Set.update(setData, {
      where: { set_num: setNum },
  })
      .then(() => {
          console.log(`Set ${setNum} updated successfully.`);
      })
      .catch((err) => {
          console.error(`Error updating set ${setNum}:`, err);
          throw err; // Reject the promise with the error
      });
}


function deleteSet(setNum) {
  return Set.destroy({
    where: { set_num: setNum },
  })
    .then(() => {
      console.log(`Set ${setNum} has been deleted successfully.`);
    })
    .catch((err) => {
      console.error('Error:', err);
      throw err;
    });
}

module.exports = { Initialize, getAllSets, getSetByNum, getSetsByTheme, deleteSet , editSet , getAllThemes};

