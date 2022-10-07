import User from "./User";

export default class Admin extends User {
	isAdmin = true;

    constructor(login, parol) {
        super(login, parol);
    }

	ban(obj) {
		if (obj.isAdmin == false) {
			obj.banUser = true;
		} else {
			alert('Вы не можете забанить админа!');
		}
	}
}