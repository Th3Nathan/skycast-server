
export default (sequelize, DataTypes) => {
    const Query = sequelize.define('query', 
        {
            time: {
                type: DataTypes.DATE, 
                allowNull: false,
                defaultValue: DataTypes.NOW,
            }, 
            longitude: {
                type: DataTypes.DECIMAL(9, 6),
                allowNull: false,
            }, 
            latitude: {
                type: DataTypes.DECIMAL(9, 6), 
                allowNull: false,
            }, 
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        },
    );

    Query.associate = function(models) {
        Query.belongsTo(models.User, {
            foreignKey: {name: 'userId', field: 'user_id'}
        });
    }
    return Query;
}