class Users {
	constructor(login, parol){
    	this.login = login;
    	this.parol = parol;
    	this.isAdmin = false;
    	this.banUser = false;
	}
}

class Admins extends Users {
	isAdmin = true;

	ban(obj) {
		if (obj.isAdmin == false) {
			obj.banUser = true;
		} else {
			alert('Вы не можете забанить админа!');
		}
	}
}

export function regAdmin(login, parol) {
	return new Admins(login, parol);
}

export function regUser(login, parol) {
	return new Users(login, parol);
}