import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
    const User = sequelize.define('user', 
        {
            username: {
                type: DataTypes.STRING, 
                notNull: true, 
                unique: true,
                validate: {
                    len: {
                        args: [3, 20],
                        msg: 'Username length must be 3-20 characters.'
                    }
                }
            },
            password: {
                type: DataTypes.STRING, 
                notNull: true,
                validate: {
                    len: {
                        args: [5, 20],
                        msg: 'Password must be 5-20 characters.'
                    }
                }
            }, 
        },
        {
            hooks: {
                afterValidate: async (user, options) => {
                    try {
                        user.password = await bcrypt.hash(user.password, 12);
                    } catch (err) {
                        console.log(err);
                    }
                    return user;
                },
            }
        }
    );

    User.associate = function(models) {
        User.hasMany(models.Query, {
            foreignKey: {name: 'userId', field: 'user_id'}
        });
    }
    return User;
}