
let nathan = {
    username: 'th3nathan',
    password: 'password',
}

let priscilla = {
    username: 'BubbleT',
    password: 'password',
}

let tokyo = {
    latitude: 35.689487,
    longitude: 139.691706,
    name: 'tokyo',
}

let montreal = {
    latitude: 45.501689,
    longitude: -73.567256,
    name: 'montreal',
}

let bangkok = {
    latitude: 13.756331,
    longitude: 100.501765,
    name: 'bangkok',
}

let seoul = {
    latitude: 37.566535,
    longitude: 126.977969,
    name: 'seoul',
}

export default async ({User, Query}) => {
    try {
        nathan = await User.create(nathan);
        priscilla = await User.create(priscilla);
        tokyo = await Query.create(tokyo);
        montreal = await Query.create(montreal);
        bangkok = await Query.create(bangkok);
        seoul = await Query.create({...seoul, userId: nathan.id});
        // await nathan.addQueries([tokyo.id, montreal.id, bangkok.id]);
        await priscilla.addQueries([seoul.id]);
        let me = await User.find(
            {where: {username: 'th3nathan'}, include: [{model: Query}]} 
        )
        let quer = await nathan.getQueries();
        console.log(quer);
    } catch (err) {
        return err;
    }
}