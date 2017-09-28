class Users {

    constructor () {
        this.users = [];
    }

    addUser (id, name, room) {
        let user = { id, name, room };
        this.users.push(user);
        return user;
    }

    removeUser (id) {
        let user = this.getUser(id);

        if (user) {
            this.users = this.users.filter(user => user.id !== id);
        }

        return user;
    }

    getUser (id) {
        return this.users.filter(user => user.id === id)[0];
    }

    getUserList (room) {
        let users = this.users.filter(user =>  user.room === room);
        return users.map(user => user.name);
    }

    getRoomList () {
        let allRooms = this.users.map(user => user.room);
        return allRooms.filter((room, index, allRooms) => allRooms.indexOf(room) == index);
    }

}

module.exports = { Users };