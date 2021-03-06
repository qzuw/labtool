
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('CodeReviews', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    points: {
      type: Sequelize.DOUBLE
    },
    reviewNumber: {
      type: Sequelize.INTEGER
    },
    linkToReview: {
      type: Sequelize.STRING
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    studentInstanceId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'StudentInstances',
        key: 'id',
        as: 'studentInstanceId'
      }
    },
    toReview: {
      type: Sequelize.INTEGER,
      references: {
        model: 'StudentInstances',
        key: 'id',
        as: 'toReview'
      }
    }
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('CodeReviews')
}
